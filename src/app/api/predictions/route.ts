import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import data from '../../../data.json';

const parseMatchDate = (dateStr: string): Date | null => {
  try {
    let day = 1;
    let month = 5;
    let hours = 0;
    let minutes = 0;

    dateStr = dateStr.replace(' hs', '').trim();
    const parts = dateStr.split(' - ');
    if (parts.length !== 2) return null;

    const datePart = parts[0].trim();
    const timePart = parts[1].trim();

    if (timePart.includes('.')) {
      const [h, m] = timePart.split('.');
      hours = parseInt(h);
      minutes = parseInt(m);
    } else if (timePart.includes(':')) {
      const [h, m] = timePart.split(':');
      hours = parseInt(h);
      minutes = parseInt(m);
    } else {
      hours = parseInt(timePart);
    }

    if (datePart.includes('/')) {
      const [d, m] = datePart.split('/');
      day = parseInt(d);
      month = parseInt(m) - 1;
    } else {
      const matchRegex = datePart.match(/(\d+)\s+de\s+(junio|julio)/i);
      if (matchRegex) {
        day = parseInt(matchRegex[1]);
        month = matchRegex[2].toLowerCase() === 'junio' ? 5 : 6;
      } else {
        const dParts = datePart.split(' ');
        day = parseInt(dParts[1]);
        const mStr = dParts[3]?.toLowerCase();
        if (mStr === 'junio') month = 5;
        else if (mStr === 'julio') month = 6;
      }
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    const isoString = `2026-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00-03:00`;
    return new Date(isoString);
  } catch (e) {
    console.error('Error parsing date:', dateStr, e);
    return null;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guest_info, predictions, existingId } = body;

    if (!guest_info || !guest_info.dni) {
      return NextResponse.json({ error: 'Missing guest information' }, { status: 400 });
    }

    // 1. Fetch real results to calculate points
    const { data: realResultsData } = await supabase.from('kusi_real_results').select('*');
    const realResults: Record<number, { scoreA: string, scoreB: string }> = {};
    if (realResultsData) {
      realResultsData.forEach(matchData => {
        realResults[parseInt(matchData.match_id)] = {
          scoreA: matchData.score_a,
          scoreB: matchData.score_b
        };
      });
    }

    // 2. Fetch existing predictions if updating, to prevent overwriting locked matches
    let existingPredictions: Record<string, any> = {};
    if (existingId) {
      const { data: existingData } = await supabase
        .from('kusi_guests_predictions')
        .select('predictions')
        .eq('id', existingId)
        .single();
      if (existingData && existingData.predictions) {
        existingPredictions = existingData.predictions;
      }
    } else {
      // Check for duplicate DNI on insert
      const { data: duplicateCheck } = await supabase
        .from('kusi_guests_predictions')
        .select('id')
        .eq('guest_info->>dni', guest_info.dni);
      if (duplicateCheck && duplicateCheck.length > 0) {
        return NextResponse.json({ error: 'DNI ya existe' }, { status: 400 });
      }
    }

    const finalPredictions: Record<string, any> = { ...predictions };

    // 3. Validate against server time
    const now = new Date();
    data.matches.forEach(match => {
      const matchDate = parseMatchDate(match.date_placeholder);
      const isFinished = realResults[match.id] && realResults[match.id].scoreA !== '' && realResults[match.id].scoreB !== '';
      let isLocked = false;
      
      if (matchDate) {
        const limitTime = new Date(matchDate.getTime() - 30 * 60000); // 30 minutes before
        if (now >= limitTime) {
          isLocked = true;
        }
      }
      
      if (isFinished || isLocked) {
        // Match is locked. Revert to existing prediction or delete if none existed.
        if (existingPredictions[match.id]) {
          finalPredictions[match.id] = existingPredictions[match.id];
        } else {
          delete finalPredictions[match.id];
        }
      }
    });

    // 4. Calculate Points
    let totalPoints = 0;
    Object.keys(finalPredictions).forEach((key) => {
      const matchId = parseInt(key);
      const pred = finalPredictions[matchId];
      const real = realResults[matchId];
      
      if (real && pred.scoreA !== '' && pred.scoreB !== '') {
        const pA = parseInt(pred.scoreA);
        const pB = parseInt(pred.scoreB);
        const rA = parseInt(real.scoreA);
        const rB = parseInt(real.scoreB);
        
        if (pA === rA && pB === rB) {
          totalPoints += 3;
        } else {
          const predDiff = pA - pB;
          const realDiff = rA - rB;
          if ((predDiff > 0 && realDiff > 0) || (predDiff < 0 && realDiff < 0) || (predDiff === 0 && realDiff === 0)) {
            totalPoints += 1;
          }
        }
      }
    });

    // 5. Save to database
    if (existingId) {
      const { error } = await supabase.from('kusi_guests_predictions').update({
        guest_info,
        predictions: finalPredictions,
        total_points: totalPoints
      }).eq('id', existingId);
      
      if (error) throw error;
    } else {
      const { error } = await supabase.from('kusi_guests_predictions').insert([{
        guest_info,
        predictions: finalPredictions,
        total_points: totalPoints
      }]);
      
      if (error) throw error;
    }

    return NextResponse.json({ success: true, totalPoints, predictions: finalPredictions });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

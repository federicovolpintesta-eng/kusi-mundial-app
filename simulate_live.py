import json
import random
import time

def load_data():
    with open('src/data.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(data):
    with open('src/data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def simulate_match(match):
    score_a = random.randint(0, 3)
    score_b = random.randint(0, 3)
    if score_a == score_b:
        # Penalties if tied
        pen_a = random.randint(3, 5)
        pen_b = random.randint(3, 5)
        while pen_a == pen_b:
            pen_a += 1
        match['score_a'] = score_a
        match['score_b'] = score_b
        match['pen_a'] = pen_a
        match['pen_b'] = pen_b
        winner = match['team_a'] if pen_a > pen_b else match['team_b']
        loser = match['team_b'] if pen_a > pen_b else match['team_a']
        return winner, loser, f"{score_a}-{score_b} (Pen {pen_a}-{pen_b})"
    else:
        match['score_a'] = score_a
        match['score_b'] = score_b
        winner = match['team_a'] if score_a > score_b else match['team_b']
        loser = match['team_b'] if score_a > score_b else match['team_a']
        return winner, loser, f"{score_a}-{score_b}"

data = load_data()

# Mappings for next stages
# Match ID -> Next Match ID, Is Team A (True) or Team B (False)
next_matches = {
    # Round of 32 -> Round of 16
    73: (89, True), 74: (89, False),
    75: (90, True), 76: (90, False),
    77: (91, True), 78: (91, False),
    79: (92, True), 80: (92, False),
    81: (93, True), 82: (93, False),
    83: (94, True), 84: (94, False),
    85: (95, True), 86: (95, False),
    87: (96, True), 88: (96, False),
    
    # Round of 16 -> Quarterfinals
    89: (97, True), 90: (97, False),
    91: (98, True), 92: (98, False),
    93: (99, True), 94: (99, False),
    95: (100, True), 96: (100, False),
    
    # Quarterfinals -> Semifinals
    97: (101, True), 98: (101, False),
    99: (102, True), 100: (102, False),
}

# Match ID lookup
matches_by_id = {m['id']: m for m in data['matches']}

print("Iniciando simulacion en tiempo real del fixture...")

for stage in ["Dieciseisavos de Final", "Octavos de Final", "Cuartos de Final", "Semifinal", "Tercer Puesto", "Final"]:
    print(f"\n--- Jugando {stage} ---")
    
    stage_matches = [m for m in data['matches'] if m.get('stage') == stage or (stage == "Semifinal" and "Semi" in m.get('stage', '')) or (stage == "Tercer Puesto" and "Tercer" in m.get('stage', '')) or (stage == "Final" and m.get('stage') == "Final")]
    
    for m in stage_matches:
        if not m.get('team_a') or not m.get('team_b') or "Ganador" in m.get('team_a') or "Perdedor" in m.get('team_a'):
            continue # Skip if teams are not defined yet (shouldn't happen if previous stages played)
            
        print(f"Simulando: {m['team_a']} vs {m['team_b']}...")
        time.sleep(1.5) # Simulate real-time delay
        
        winner, loser, res_str = simulate_match(m)
        m['status'] = 'finished'
        print(f"Resultado: {m['team_a']} {res_str} {m['team_b']} -> Clasifica: {winner}")
        
        # Advance to next match
        if m['id'] in next_matches:
            next_id, is_team_a = next_matches[m['id']]
            next_m = matches_by_id[next_id]
            if is_team_a:
                next_m['team_a'] = winner
            else:
                next_m['team_b'] = winner
                
        # Special case for Semifinals -> Final and Third Place
        if m['id'] in [101, 102]:
            final_m = matches_by_id[104]
            third_m = matches_by_id[103]
            if m['id'] == 101:
                final_m['team_a'] = winner
                third_m['team_a'] = loser
            else:
                final_m['team_b'] = winner
                third_m['team_b'] = loser

        # Update dates/stadiums if not set
        if 'date_placeholder' not in m or m['date_placeholder'] == 'TBD':
            m['date_placeholder'] = "Fecha Simulada"
        if 'stadium_placeholder' not in m or m['stadium_placeholder'] == 'TBD':
            m['stadium_placeholder'] = "Estadio Simulado"

        save_data(data)

print("\n¡Campeonato Finalizado!")

import json

with open('src/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Reset Octavos, Cuartos, Semis, Final, and any Dieciseisavos that happen after June 30
for match in data['matches']:
    if match['id'] >= 73: # All knockout matches
        # If it's Octavos or later, it hasn't happened yet.
        if match['stage'] != "Dieciseisavos de Final":
            if match['id'] >= 89:
                match['team_a'] = f"Ganador {match['id'] - 16}" # roughly
            match['score_a'] = None
            match['score_b'] = None
            match['pen_a'] = None
            match['pen_b'] = None
            match['status'] = 'scheduled'
        else:
            # It's Dieciseisavos (73-88)
            # Let's say matches 73 to 78 have finished (June 28-29), matches 79-80 are 'live' (June 30), matches 81-88 are 'scheduled' (July 1-3)
            if match['id'] <= 78:
                pass # keep as finished
            elif match['id'] <= 80:
                match['status'] = 'live'
            else:
                match['score_a'] = None
                match['score_b'] = None
                match['pen_a'] = None
                match['pen_b'] = None
                match['status'] = 'scheduled'

# Fix team names for Octavos
octavos_mappings = {
    89: ("Ganador D1", "Ganador D2"),
    90: ("Ganador D3", "Ganador D4"),
    91: ("Ganador D5", "Ganador D6"),
    92: ("Ganador D7", "Ganador D8"),
    93: ("Ganador D9", "Ganador D10"),
    94: ("Ganador D11", "Ganador D12"),
    95: ("Ganador D13", "Ganador D14"),
    96: ("Ganador D15", "Ganador D16")
}
for match in data['matches']:
    if match['id'] in octavos_mappings:
        match['team_a'] = octavos_mappings[match['id']][0]
        match['team_b'] = octavos_mappings[match['id']][1]

cuartos = {97: ("Ganador O1", "Ganador O2"), 98: ("Ganador O3", "Ganador O4"), 99: ("Ganador O5", "Ganador O6"), 100: ("Ganador O7", "Ganador O8")}
for match in data['matches']:
    if match['id'] in cuartos:
        match['team_a'] = cuartos[match['id']][0]
        match['team_b'] = cuartos[match['id']][1]

semis = {101: ("Ganador C1", "Ganador C2"), 102: ("Ganador C3", "Ganador C4")}
for match in data['matches']:
    if match['id'] in semis:
        match['team_a'] = semis[match['id']][0]
        match['team_b'] = semis[match['id']][1]

for match in data['matches']:
    if match['id'] == 103:
        match['team_a'] = "Perdedor S1"
        match['team_b'] = "Perdedor S2"
    if match['id'] == 104:
        match['team_a'] = "Ganador S1"
        match['team_b'] = "Ganador S2"

with open('src/data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Knockout matches reset to current simulated date state.")

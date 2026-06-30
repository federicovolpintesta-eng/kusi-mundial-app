import json
import random

with open('src/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# The groups
groups = data['groups']

# Select 32 teams: Top 2 from each of the 12 groups (24 teams) + 8 best third places.
# Since we don't have group stage points, we'll just randomly select 2 from each group + 8 random 3rd places.
qualified_teams = []
third_places = []
for g, teams in groups.items():
    # randomly shuffle teams to pick
    shuffled = teams.copy()
    random.shuffle(shuffled)
    qualified_teams.append(shuffled[0])
    qualified_teams.append(shuffled[1])
    third_places.append(shuffled[2])

# Pick 8 best third places
random.shuffle(third_places)
qualified_teams.extend(third_places[:8])

# We need 32 teams for matches 73 to 88 (Round of 32).
random.shuffle(qualified_teams)

# Update matches 73 to 88 with the teams, dates, and stadiums.
# R32 dates: June 28 - July 3
stadiums = ["Estadio Azteca", "Estadio Dallas", "Estadio Los Ángeles", "Estadio Miami", "Estadio Nueva York Nueva Jersey", "Estadio Atlanta", "Estadio Houston", "Estadio Seattle"]
dates_r32 = ["Domingo 28 de junio", "Lunes 29 de junio", "Martes 30 de junio", "Miércoles 1 de julio", "Jueves 2 de julio", "Viernes 3 de julio"]

idx = 0
for match in data['matches']:
    if match['id'] >= 73 and match['id'] <= 88:
        match['team_a'] = qualified_teams[idx]
        match['team_b'] = qualified_teams[idx+1]
        match['date_placeholder'] = random.choice(dates_r32) + " - " + random.choice(["13 hs", "16 hs", "19 hs", "22 hs"])
        match['stadium_placeholder'] = random.choice(stadiums)
        match['score_a'] = None
        match['score_b'] = None
        match['status'] = 'scheduled'
        idx += 2

# Save the updated data.json
with open('src/data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Round of 32 teams, dates, and stadiums have been populated!")

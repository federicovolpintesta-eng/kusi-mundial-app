import json

with open('src/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

updates = {
    # Group A
    1: {"date": "Jueves 11 de junio - 16 hs", "stadium": "Estadio Ciudad de México"},
    2: {"date": "Jueves 11 de junio - 23 hs", "stadium": "Estadio Guadalajara"},
    3: {"date": "Jueves 18 de junio - 13 hs", "stadium": "Estadio Atlanta"},
    4: {"date": "Jueves 18 de junio - 22 hs", "stadium": "Estadio Guadalajara"},
    5: {"date": "Miércoles 24 de junio - 22 hs", "stadium": "Estadio Ciudad de México"},
    6: {"date": "Miércoles 24 de junio - 22 hs", "stadium": "Estadio Monterrey"},
    
    # Group B
    7: {"date": "Viernes 12 de junio - 16 hs", "stadium": "Estadio Toronto"},
    8: {"date": "Sábado 13 de junio - 16 hs", "stadium": "Estadio Bahía de San Francisco"},
    9: {"date": "Jueves 18 de junio - 16 hs", "stadium": "Estadio Los Ángeles"},
    10: {"date": "Jueves 18 de junio - 19 hs", "stadium": "Estadio BC Place Vancouver"},
    11: {"date": "Miércoles 24 de junio - 16 hs", "stadium": "Estadio BC Place Vancouver"},
    12: {"date": "Miércoles 24 de junio - 16 hs", "stadium": "Estadio Seattle"},

    # Group C
    13: {"date": "Sábado 13 de junio - 19 hs", "stadium": "Estadio Nueva York Nueva Jersey"},
    14: {"date": "Sábado 13 de junio - 22 hs", "stadium": "Estadio Boston"},
    15: {"date": "Viernes 19 de junio - 19 hs", "stadium": "Estadio Boston"},
    16: {"date": "Viernes 19 de junio - 22 hs", "stadium": "Estadio Filadelfia"},
    17: {"date": "Miércoles 24 de junio - 19 hs", "stadium": "Estadio Miami"},
    18: {"date": "Miércoles 24 de junio - 19 hs", "stadium": "Estadio Atlanta"},

    # Group D
    19: {"date": "Viernes 12 de junio - 22 hs", "stadium": "Estadio Los Ángeles"},
    20: {"date": "Sábado 13 de junio - 01 hs", "stadium": "Estadio BC Place Vancouver"},
    21: {"date": "Viernes 19 de junio - 01 hs", "stadium": "Estadio Bahía de San Francisco"},
    22: {"date": "Viernes 19 de junio - 16 hs", "stadium": "Estadio Seattle"},
    23: {"date": "Jueves 25 de junio - 23 hs", "stadium": "Estadio Los Ángeles"},
    24: {"date": "Jueves 25 de junio - 23 hs", "stadium": "Estadio Bahía de San Francisco"},

    # Dieciseisavos
    73: {"date": "28/06 - 16 hs", "stadium": "Estadio Los Ángeles", "a": "2°GRUPO A", "b": "2°GRUPO B"},
    74: {"date": "29/06 - 17.30 hs", "stadium": "Estadio Boston", "a": "1°GRUPO E", "b": "3°GRUPO A/B/C/D/F"},
    75: {"date": "29/06 - 22 hs", "stadium": "Estadio Monterrey", "a": "1°GRUPO F", "b": "2°GRUPO C"},
    76: {"date": "29/06 - 14 hs", "stadium": "Estadio Houston", "a": "1°GRUPO I", "b": "3°GRUPO C/D/F/G/H"},
    77: {"date": "30/06 - 18 hs", "stadium": "Estadio Nueva York Nueva Jersey", "a": "1°GRUPO C", "b": "3°GRUPO A/B/F/G/H"},
    78: {"date": "30/06 - 14 hs", "stadium": "Estadio Dallas", "a": "2°GRUPO E", "b": "2°GRUPO I"},
    79: {"date": "30/06 - 22 hs", "stadium": "Estadio Ciudad de México", "a": "1°GRUPO A", "b": "3°GRUPO C/E/F/H/I"},
    80: {"date": "01/07 - 13 hs", "stadium": "Estadio Atlanta", "a": "1°GRUPO L", "b": "3°GRUPO E/H/I/J/K"},
    81: {"date": "01/07 - 21 hs", "stadium": "Estadio Bahía de San Francisco", "a": "1°GRUPO D", "b": "3°GRUPO B/E/F/I/J"},
    82: {"date": "01/07 - 17 hs", "stadium": "Estadio Seattle", "a": "1°GRUPO G", "b": "3°GRUPO A/E/H/I/J"},
    83: {"date": "02/07 - 20 hs", "stadium": "Estadio Toronto", "a": "2°GRUPO K", "b": "2°GRUPO L"},
    84: {"date": "02/07 - 16 hs", "stadium": "Estadio Los Ángeles", "a": "1°GRUPO H", "b": "2°GRUPO J"},
    85: {"date": "03/07 - 00 hs", "stadium": "Estadio BC Place Vancouver", "a": "1°GRUPO B", "b": "3°GRUPO E/F/G/I/J"},
    86: {"date": "03/07 - 19 hs", "stadium": "Estadio Miami", "a": "1°GRUPO J", "b": "2°GRUPO H"},
    87: {"date": "03/07 - 22.30 hs", "stadium": "Estadio Kansas City", "a": "1°GRUPO K", "b": "3°GRUPO D/E/I/J/L"},
    88: {"date": "03/07 - 15 hs", "stadium": "Estadio Dallas", "a": "2°GRUPO D", "b": "2°GRUPO G"},

    # Octavos
    89: {"date": "04/07 - 18 hs", "stadium": "Estadio Filadelfia", "a": "GANADOR PARTIDO 74", "b": "GANADOR PARTIDO 77"},
    90: {"date": "04/07 - 14 hs", "stadium": "Estadio Houston", "a": "GANADOR PARTIDO 73", "b": "GANADOR PARTIDO 75"},
    91: {"date": "05/07 - 17 hs", "stadium": "Estadio Nueva York Nueva Jersey", "a": "GAN. PARTIDO 76", "b": "GAN. PARTIDO 78"},
    92: {"date": "05/07 - 21 hs", "stadium": "Estadio Ciudad de México", "a": "GANADOR PARTIDO 79", "b": "GANADOR PARTIDO 80"},
    93: {"date": "06/07 - 16 hs", "stadium": "Estadio Dallas", "a": "GANADOR PARTIDO 83", "b": "GANADOR PARTIDO 84"},
    94: {"date": "06/07 - 21 hs", "stadium": "Estadio Seattle", "a": "GANADOR PARTIDO 81", "b": "GANADOR PARTIDO 82"},
    95: {"date": "07/07 - 13 hs", "stadium": "Estadio Atlanta", "a": "GANADOR PARTIDO 86", "b": "GANADOR PARTIDO 88"},
    96: {"date": "07/07 - 17 hs", "stadium": "Estadio BC Place Vancouver", "a": "GAN. PARTIDO 85", "b": "GAN. PARTIDO 87"},

    # Cuartos
    97: {"date": "09/07 - 17 hs", "stadium": "Estadio Boston", "a": "GANADOR PARTIDO 89", "b": "GANADOR PARTIDO 90"},
    98: {"date": "10/07 - 16 hs", "stadium": "Estadio Los Ángeles", "a": "GANADOR PARTIDO 93", "b": "GANADOR PARTIDO 94"},
    99: {"date": "11/07 - 18 hs", "stadium": "Estadio Miami", "a": "GANADOR PARTIDO 91", "b": "GANADOR PARTIDO 92"},
    100: {"date": "11/07 - 22 hs", "stadium": "Estadio Kansas City", "a": "GANADOR PARTIDO 95", "b": "GANADOR PARTIDO 96"},

    # Semifinal
    101: {"date": "14/07 - 16 hs", "stadium": "Estadio Dallas", "a": "GANADOR PARTIDO 97", "b": "GANADOR PARTIDO 98"},
    102: {"date": "14/07 - 16 hs", "stadium": "Estadio Atlanta", "a": "GANADOR PARTIDO 99", "b": "GANADOR PARTIDO 100"},

    # Tercer Puesto
    103: {"date": "18/07 - 18 hs", "stadium": "Estadio Miami", "a": "PERDEDOR PARTIDO 101", "b": "PERDEDOR PARTIDO 102"},

    # Final
    104: {"date": "19/07 - 16 hs", "stadium": "Estadio Nueva York Nueva Jersey", "a": "GANADOR PARTIDO 101", "b": "GANADOR PARTIDO 102"},
}

for match in data['matches']:
    if match['id'] in updates:
        upd = updates[match['id']]
        match['date_placeholder'] = upd['date']
        match['stadium_placeholder'] = upd['stadium']
        if 'a' in upd:
            match['team_a'] = upd['a']
        if 'b' in upd:
            match['team_b'] = upd['b']

with open('src/data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated data.json successfully!")

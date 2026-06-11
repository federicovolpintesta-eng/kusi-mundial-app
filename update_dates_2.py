import json

with open('src/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

updates = {
    # Group E
    25: {"date": "Domingo 14 de junio - 14 hs", "stadium": "Estadio Houston", "a": "ALEMANIA", "b": "CURAZAO"},
    26: {"date": "Domingo 14 de junio - 20 hs", "stadium": "Estadio Filadelfia", "a": "COSTA DE MARFIL", "b": "ECUADOR"},
    27: {"date": "Sábado 20 de junio - 17 hs", "stadium": "Estadio Toronto", "a": "ALEMANIA", "b": "COSTA DE MARFIL"},
    28: {"date": "Sábado 20 de junio - 23 hs", "stadium": "Estadio Kansas City", "a": "ECUADOR", "b": "CURAZAO"},
    29: {"date": "Jueves 25 de junio - 17 hs", "stadium": "Estadio Filadelfia", "a": "CURAZAO", "b": "COSTA DE MARFIL"},
    30: {"date": "Jueves 25 de junio - 17 hs", "stadium": "Estadio Nueva York Nueva Jersey", "a": "ECUADOR", "b": "ALEMANIA"},

    # Group F
    31: {"date": "Domingo 14 de junio - 17 hs", "stadium": "Estadio Dallas", "a": "PAISES BAJOS", "b": "JAPON"},
    32: {"date": "Domingo 14 de junio - 23 hs", "stadium": "Estadio Monterrey", "a": "SUECIA", "b": "TUNEZ"},
    33: {"date": "Sábado 20 de junio - 14 hs", "stadium": "Estadio Houston", "a": "PAISES BAJOS", "b": "SUECIA"},
    34: {"date": "Sábado 20 de junio - 01 hs", "stadium": "Estadio Monterrey", "a": "TUNEZ", "b": "JAPON"},
    35: {"date": "Jueves 25 de junio - 20 hs", "stadium": "Estadio Dallas", "a": "JAPON", "b": "SUECIA"},
    36: {"date": "Jueves 25 de junio - 20 hs", "stadium": "Estadio Kansas City", "a": "TUNEZ", "b": "PAISES BAJOS"},

    # Group G
    37: {"date": "Lunes 15 de junio - 16 hs", "stadium": "Estadio Seattle", "a": "BELGICA", "b": "EGIPTO"},
    38: {"date": "Lunes 15 de junio - 22 hs", "stadium": "Estadio Los Ángeles", "a": "IRAN", "b": "NUEVA ZELANDA"},
    39: {"date": "Domingo 21 de junio - 16 hs", "stadium": "Estadio Los Ángeles", "a": "BELGICA", "b": "IRAN"},
    40: {"date": "Domingo 21 de junio - 22 hs", "stadium": "Estadio BC Place Vancouver", "a": "NUEVA ZELANDA", "b": "EGIPTO"},
    41: {"date": "Viernes 26 de junio - 00 hs", "stadium": "Estadio Seattle", "a": "EGIPTO", "b": "IRAN"},
    42: {"date": "Viernes 26 de junio - 00 hs", "stadium": "Estadio BC Place Vancouver", "a": "NUEVA ZELANDA", "b": "BELGICA"},

    # Group H
    43: {"date": "Lunes 15 de junio - 13 hs", "stadium": "Estadio Atlanta", "a": "ESPAÑA", "b": "CABO VERDE"},
    44: {"date": "Lunes 15 de junio - 19 hs", "stadium": "Estadio Miami", "a": "ARABIA SAUDI", "b": "URUGUAY"},
    45: {"date": "Domingo 21 de junio - 13 hs", "stadium": "Estadio Atlanta", "a": "ESPAÑA", "b": "ARABIA SAUDI"},
    46: {"date": "Domingo 21 de junio - 19 hs", "stadium": "Estadio Miami", "a": "URUGUAY", "b": "CABO VERDE"},
    47: {"date": "Viernes 26 de junio - 21 hs", "stadium": "Estadio Houston", "a": "CABO VERDE", "b": "ARABIA SAUDI"},
    48: {"date": "Viernes 26 de junio - 21 hs", "stadium": "Estadio Guadalajara", "a": "URUGUAY", "b": "ESPAÑA"},

    # Group I
    49: {"date": "Martes 16 de junio - 16 hs", "stadium": "Estadio Nueva York Nueva Jersey", "a": "FRANCIA", "b": "SENEGAL"},
    50: {"date": "Martes 16 de junio - 19 hs", "stadium": "Estadio Boston", "a": "IRAK", "b": "NORUEGA"},
    51: {"date": "Lunes 22 de junio - 18 hs", "stadium": "Estadio Filadelfia", "a": "FRANCIA", "b": "IRAK"},
    52: {"date": "Lunes 22 de junio - 21 hs", "stadium": "Estadio Nueva York Nueva Jersey", "a": "NORUEGA", "b": "SENEGAL"},
    53: {"date": "Viernes 26 de junio - 16 hs", "stadium": "Estadio Boston", "a": "NORUEGA", "b": "FRANCIA"},
    54: {"date": "Viernes 26 de junio - 16 hs", "stadium": "Estadio Toronto", "a": "SENEGAL", "b": "IRAK"},

    # Group J
    55: {"date": "Martes 16 de junio - 22 hs", "stadium": "Estadio Kansas City", "a": "ARGENTINA", "b": "ARGELIA"},
    56: {"date": "Martes 16 de junio - 01 hs", "stadium": "Estadio Bahía de San Francisco", "a": "AUSTRIA", "b": "JORDANIA"},
    57: {"date": "Lunes 22 de junio - 14 hs", "stadium": "Estadio Dallas", "a": "ARGENTINA", "b": "AUSTRIA"},
    58: {"date": "Lunes 22 de junio - 00 hs", "stadium": "Estadio Bahía de San Francisco", "a": "JORDANIA", "b": "ARGELIA"},
    59: {"date": "Sábado 27 de junio - 23 hs", "stadium": "Estadio Kansas City", "a": "ARGELIA", "b": "AUSTRIA"},
    60: {"date": "Sábado 27 de junio - 23 hs", "stadium": "Estadio Dallas", "a": "JORDANIA", "b": "ARGENTINA"},

    # Group K
    61: {"date": "Miércoles 17 de junio - 14 hs", "stadium": "Estadio Houston", "a": "PORTUGAL", "b": "CONGO"},
    62: {"date": "Miércoles 17 de junio - 23 hs", "stadium": "Estadio Ciudad de México", "a": "UZBEKISTAN", "b": "COLOMBIA"},
    63: {"date": "Martes 23 de junio - 14 hs", "stadium": "Estadio Houston", "a": "PORTUGAL", "b": "UZBEKISTAN"},
    64: {"date": "Martes 23 de junio - 23 hs", "stadium": "Estadio Guadalajara", "a": "COLOMBIA", "b": "CONGO"},
    65: {"date": "Sábado 27 de junio - 20.30 hs", "stadium": "Estadio Miami", "a": "COLOMBIA", "b": "PORTUGAL"},
    66: {"date": "Sábado 27 de junio - 20.30 hs", "stadium": "Estadio Atlanta", "a": "CONGO", "b": "UZBEKISTAN"},

    # Group L
    67: {"date": "Miércoles 17 de junio - 17 hs", "stadium": "Estadio Dallas", "a": "INGLATERRA", "b": "CROACIA"},
    68: {"date": "Miércoles 17 de junio - 20 hs", "stadium": "Estadio Toronto", "a": "GHANA", "b": "PANAMA"},
    69: {"date": "Martes 23 de junio - 17 hs", "stadium": "Estadio Boston", "a": "INGLATERRA", "b": "GHANA"},
    70: {"date": "Martes 23 de junio - 20 hs", "stadium": "Estadio Toronto", "a": "PANAMA", "b": "CROACIA"},
    71: {"date": "Sábado 27 de junio - 18 hs", "stadium": "Estadio Nueva York Nueva Jersey", "a": "PANAMA", "b": "INGLATERRA"},
    72: {"date": "Sábado 27 de junio - 18 hs", "stadium": "Estadio Filadelfia", "a": "CROACIA", "b": "GHANA"},
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

print("Updated data.json successfully for Groups E-L!")

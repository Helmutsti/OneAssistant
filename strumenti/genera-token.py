# -*- coding: utf-8 -*-
"""Genera docs/design/L1 - Token.dc.html"""
import io, re

BASE = r"C:\Users\Mcucca.MEPINFORMATICA\Desktop\OneAssistant\docs\design"
DST = BASE + r"\L1 - Token.dc.html"

# ---- i dodici temi da temi.css ----
css = io.open(BASE + r"\temi.css", encoding="utf-8").read()
blocchi = re.findall(r'([^\{\}\n]+)\{([^\}]*)\}', css)
temi = {}
for sel, corpo in blocchi:
    m = re.search(r"data-colori='([a-z]+)'", sel)
    if not m:
        continue
    scuro = "data-tema='scuro'" in sel
    v = dict((k, val.strip()) for k, val in re.findall(r'(--[a-z0-9-]+)\s*:\s*([^;]+);', corpo))
    temi.setdefault(m.group(1), {})["scuro" if scuro else "chiaro"] = v

def campioni(nome, v):
    barre = "".join('<div style="flex:1;height:100%%;background:%s"></div>' % v[k]
                    for k in ['--f1', '--f2', '--f3', '--f4'] if k in v)
    return ('<div style="border-radius:12px;overflow:hidden;border:1px solid rgba(26,28,25,0.12)">'
            '<div style="display:flex;height:46px">%s</div>'
            '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#FBFBF9">'
            '<span style="width:11px;height:11px;border-radius:3px;background:%s;flex:none;'
            'border:1px solid rgba(26,28,25,0.14)"></span>'
            '<span style="font-size:13px;font-weight:500">%s</span></div></div>'
            % (barre, v.get('--inchiostro', '#1A1C19'), nome))

griglia = []
for nome in sorted(temi):
    ch = temi[nome].get("chiaro", {})
    sc = temi[nome].get("scuro", {})
    griglia.append('<div style="display:flex;flex-direction:column;gap:8px">%s%s</div>'
                   % (campioni(nome, ch), campioni(nome + " · scuro", sc)))
TEMI = "".join(griglia)

def riga(nome, valore, spiega, campione=None):
    q = ('<span style="width:26px;height:26px;border-radius:7px;background:%s;flex:none;'
         'border:1px solid rgba(26,28,25,0.14)"></span>' % campione) if campione else \
        '<span style="width:26px;flex:none"></span>'
    return ('<div style="display:grid;grid-template-columns:38px 190px 150px 1fr;align-items:center;gap:16px;'
            'padding:13px 22px;border-top:1px solid rgba(26,28,25,0.10)">%s'
            '<div style="font-size:15.5px;font-weight:500">%s</div>'
            '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:12.5px;color:#4A4E48">%s</div>'
            '<div style="font-size:14.5px;color:#4A4E48;line-height:1.5">%s</div></div>'
            % (q, nome, valore, spiega))

def tabella(titolo, sottotitolo, righe):
    return ('<div style="display:flex;flex-direction:column;gap:14px">'
            '<div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap">'
            '<div style="font-size:28px;font-weight:500;letter-spacing:-0.025em">%s</div>'
            '<div style="font-size:16px;color:#4A4E48">%s</div></div>'
            '<div style="width:1440px;max-width:100%%;border-radius:20px;background:#FBFBF9;'
            'border:1px solid rgba(26,28,25,0.12);overflow:hidden">%s</div></div>'
            % (titolo, sottotitolo, "".join(righe)))

STATO = tabella("Colore di stato", "Tre tinte e un'assenza. Il significato sta in <span style=\"font-family:'IBM Plex Mono',monospace;font-size:14px\">docs/L01</span>.", [
    riga("grigio", "#94968E", "la bozza: non &egrave; ancora partita", "#94968E"),
    riga("azzurro", "#009DD6", "il sistema sta lavorando", "#009DD6"),
    riga("ambra", "#EDA31C", "la palla &egrave; tua", "#EDA31C"),
    riga("nessun colore", "&mdash;", "non chiede niente: ha finito, o l&rsquo;hai rimandato"),
    riga("verde", "#00A878", "<strong style=\"color:#1A1C19\">non &egrave; uno stato</strong>: il suggerimento del sistema &mdash; la bolla active, e la frase pi&ugrave; probabile in INPUT", "#00A878"),
])

INK = tabella("Inchiostro e fondo", "I valori base. Ogni tema li ridefinisce, e non tocca nient&rsquo;altro.", [
    riga("inchiostro", "#1A1C19", "il testo pieno, sempre", "#1A1C19"),
    riga("corpo", "#3E423C", "il testo di lettura", "#3E423C"),
    riga("tenue", "#4A4E48", "le spiegazioni", "#4A4E48"),
    riga("fioco", "#5A5F58", "le targhe e le etichette", "#5A5F58"),
    riga("carta", "#E4E1DA", "il fondo dei documenti di design", "#E4E1DA"),
    riga("fondo", "--f1 &rarr; --f4", "quattro fermate, dal chiaro allo scuro: 82% &rarr; 50% in chiaro, 22% &rarr; 8% in scuro"),
])

GEOM = tabella("Geometria", "Raggi, margini e passo. <strong style=\"color:#8A5A17\">Oggi questi valori vivono solo in <span style=\"font-family:'IBM Plex Mono',monospace;font-size:14px\">src/stile/base.css</span></strong>: da qui in poi la fonte &egrave; questa.", [
    riga("raggio chip", "20 px", "la taglia pi&ugrave; contratta"),
    riga("raggio carta", "22 px", "le righe del cassetto"),
    riga("raggio task", "26 px", "la bolla sulla scrivania"),
    riga("raggio pannello", "30 px", "la taglia aperta, e il velo della Profilebar"),
    riga("margine", "44 px", "ogni ancoraggio al bordo dello schermo"),
    riga("aria", "22 px", "fra i componenti della guida di destra &mdash; met&agrave; del margine"),
    riga("icona", "14 / 16 px", "14 nella bolla e nel chip, 16 nella riga del cassetto e nella cornice (legge 06)"),
    riga("pallino", "9 px", "un segno solo, un diametro solo: la bolla active, la frase pi&ugrave; probabile, l&rsquo;ascolto, l&rsquo;inizio di una cosa sulla Timeline"),
    riga("Sidebar", "44 / 180", "l&rsquo;ancoraggio del cassetto, dal bordo destro e dall&rsquo;alto"),
    riga("passo interno", "4 / 8 / 12 / 16 / 24", "le distanze dentro un componente. Niente separatori: sono gli spazi a distinguere i gruppi"),
])

VETRO = tabella("Vetro", "Una sola famiglia: stesso film, stesso bordo, stesse ombre. In <span style=\"font-family:'IBM Plex Mono',monospace;font-size:14px\">liquid-glass.css</span>.", [
    riga("--liquid-film", "riposo", "il livello normale: dietro si vede il mondo, sfocato e saturo"),
    riga("--liquid-focus", "a fuoco", "film +12% e ombra pi&ugrave; profonda"),
    riga("--liquid-quiet", "in uscita", "pi&ugrave; trasparente, prima di svanire"),
    riga("--liquid-optics", "blur 12 &middot; sat 1.65", "in scuro il blur scende a 10: un fondo scuro sfocato di pi&ugrave; diventa una macchia"),
    riga("--liquid-edge", "bordo e ombre", "filo chiaro esterno, ombra interna, caustica in basso. Non cambia con lo stato"),
    riga("opacit&agrave;", "84 / 78 / 62", "ci&ograve; che &egrave; a fuoco / ci&ograve; che aspetta / ci&ograve; che informa. Mai un quarto livello"),
])

TIPO = tabella("Tipografia", "Una famiglia, tre pesi. Il grassetto non esiste: dove serve enfasi si cambia scala.", [
    riga("Manrope 200", "numeri, titoli grandi", "il peso della calma"),
    riga("Manrope 300", "le frasi", "il testo che si legge"),
    riga("Manrope 500", "le etichette", "e i nomi dei task"),
    riga("IBM Plex Mono", "targhe, dati, stati, misure", "cifre tabellari: &laquo;9:05&raquo; e &laquo;17:50&raquo; devono stare ferme"),
    riga("scale", "11 &middot; 12 &middot; 14 &middot; 16 &middot; 18 &middot; 20 &middot; 21 &middot; 28", "11 Systembar &middot; 14 Profilebar &middot; 16/26 corpo &middot; 20 Timeline &middot; 21 titolo di bolla &middot; 28 titolo di sezione"),
    riga("titolo di bolla", "32 caratteri", "una riga sola. Se non ci sta, il titolo &egrave; sbagliato: quel che avanza &egrave; contesto"),
])

MOV = tabella("Movimento", "Ogni spostamento ha un motivo dichiarabile a parole. Il dettaglio sta in <span style=\"font-family:'IBM Plex Mono',monospace;font-size:14px\">L2 - Bubble movement</span>.", [
    riga("onda", "12 px", "lo spostamento massimo di una vicina alla nascita di una bolla"),
    riga("sfalsamento", "40 ms", "fra una vicina e la successiva, in ordine di distanza"),
    riga("rientro", "40%", "le vicine restano dove l&rsquo;onda le ha lasciate, con un rientro parziale"),
    riga("campanella", "640 ms", "squilla una volta, non in loop"),
    riga("pulsazione", "4 s", "il contorno di ci&ograve; che lavora: l&rsquo;unico segno di vita"),
])

APERTI = ""

TESTA = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<meta name="design_doc_mode" content="canvas">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  body { margin: 0; background: #E4E1DA; }
  a { color: #4E6B54; text-decoration: none; }
</style>
<link rel="stylesheet" href="./liquid-glass.css">
<link rel="stylesheet" href="./materiali.css">
</helmet>

<section style="width:max-content;padding:64px;font-family:Manrope,sans-serif;color:#1A1C19;display:flex;flex-direction:column;gap:48px;background:#E4E1DA">

  <div style="width:1440px;max-width:100%;display:flex;align-items:flex-end;justify-content:space-between;gap:40px;flex-wrap:wrap">
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:11.5px;font-weight:600;letter-spacing:0.1em;background:#1A1C19;color:#F2F1ED;border-radius:5px;padding:4px 9px">L1</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#5A5F58">Livello 1 / fondamenta / ogni valore una volta sola</div>
      </div>
      <div style="font-size:44px;font-weight:500;letter-spacing:-0.035em;line-height:1">TOKEN</div>
      <div style="font-size:18px;color:#3E423C;margin-top:12px;max-width:42em;line-height:1.55">Colori, misure, materiali e tempi del sistema. <strong style="font-weight:600">Un valore si scrive qui, e altrove si cita.</strong> Un numero ripetuto in due tavole &egrave; un numero che fra un mese ne dice due.</div>
    </div>
    <div style="font-family:'IBM Plex Mono',monospace;font-size:15px;color:#4A4E48;line-height:1.7;text-align:right;letter-spacing:0.02em">tre tinte di stato, e un&rsquo;assenza<br>una famiglia di vetro<br>una famiglia di caratteri, tre pesi<br>il margine &egrave; 44, sempre</div>
  </div>
"""

CODA = """
  <div style="width:1440px;max-width:100%;border-radius:20px;padding:24px 28px;box-sizing:border-box;background:#1A1C19;color:#F4F3EE">
    <div style="font-family:'IBM Plex Mono',monospace;font-size:11.5px;letter-spacing:0.05em;line-height:2">UN VALORE SI SCRIVE QUI, E ALTROVE SI CITA<br>UN TEMA CAMBIA IL FONDO E L&rsquo;INCHIOSTRO, E NIENT&rsquo;ALTRO<br>GLI STATI RESTANO TRE, IN TUTTI E DODICI</div>
  </div>

</section>

</x-dc>
</body>
</html>
"""

TEMI_SEZ = ('<div style="display:flex;flex-direction:column;gap:14px">'
            '<div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap">'
            '<div style="font-size:28px;font-weight:500;letter-spacing:-0.025em">I dodici temi, come varianti</div>'
            '<div style="font-size:16px;color:#4A4E48">Si sceglie nel profilo. Cambia il fondo e l&rsquo;inchiostro: gli stati non cambiano mai.</div></div>'
            '<div style="width:1440px;max-width:100%%;display:grid;grid-template-columns:repeat(4,1fr);gap:18px">%s</div>'
            '<div style="font-size:14.5px;color:#4A4E48;line-height:1.55;max-width:60em">Ogni riquadro mostra le quattro fermate del fondo e il quadratino dell&rsquo;inchiostro; sotto, la variante scura. '
            '<strong style="color:#8A5A17">I valori sono generati</strong> da uno script che nel repo non esiste pi&ugrave;: finch&eacute; non torna, si correggono a mano in '
            '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:14px">temi.css</span>.</div></div>') % TEMI

doc = TESTA + STATO + INK + TEMI_SEZ + GEOM + VETRO + TIPO + MOV + APERTI + CODA
io.open(DST, "w", encoding="utf-8").write(doc)
import re as _re
print("scritto: %d caratteri | temi: %d | div %d/%d"
      % (len(doc), len(temi), len(_re.findall(r'<div\b', doc)), len(_re.findall(r'</div>', doc))))

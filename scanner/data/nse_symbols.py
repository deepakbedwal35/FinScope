"""
nse_symbols.py
All NSE listed stocks (~2000) with .NS suffix for yfinance
Grouped by category for UI filtering
"""

# ── NIFTY 50 ──────────────────────────────────────────────────────────────────
NIFTY50 = [
    "ADANIENT","ADANIPORTS","APOLLOHOSP","ASIANPAINT","AXISBANK",
    "BAJAJ-AUTO","BAJFINANCE","BAJAJFINSV","BPCL","BHARTIARTL",
    "BRITANNIA","CIPLA","COALINDIA","DIVISLAB","DRREDDY",
    "EICHERMOT","GRASIM","HCLTECH","HDFCBANK","HDFCLIFE",
    "HEROMOTOCO","HINDALCO","HINDUNILVR","ICICIBANK","ITC",
    "INDUSINDBK","INFY","JSWSTEEL","KOTAKBANK","LT",
    "LTIM","M&M","MARUTI","NESTLEIND","NTPC",
    "ONGC","POWERGRID","RELIANCE","SBILIFE","SBIN",
    "SUNPHARMA","TCS","TATACONSUM","TATAMOTORS","TATASTEEL",
    "TECHM","TITAN","ULTRACEMCO","UPL","WIPRO"
]

# ── NIFTY NEXT 50 ─────────────────────────────────────────────────────────────
NIFTY_NEXT50 = [
    "ABB","ADANIENSOL","ADANIGREEN","ADANIPOWER","ATGL",
    "AMBUJACEM","DMART","BANKBARODA","BERGEPAINT","BEL",
    "BOSCHLTD","CANBK","CHOLAFIN","COLPAL","DLF",
    "DABUR","GAIL","GODREJCP","GODREJPROP","HAVELLS",
    "HAL","ICICIGI","ICICIPRULI","IOC","IRCTC",
    "INDIGO","JINDALSTEL","LICI","MARICO","MOTHERSON",
    "MUTHOOTFIN","NHPC","NMDC","OFSS","PIDILITIND",
    "PFC","PIIND","PNB","RECLTD","SBICARD",
    "SRF","SHREECEM","SIEMENS","TATAPOWER","TORNTPHARM",
    "TRENT","VBL","VEDL","ZOMATO","ZYDUSLIFE"
]

# ── NIFTY MIDCAP 150 ──────────────────────────────────────────────────────────
NIFTY_MIDCAP = [
    "AARTIIND","ABBOTINDIA","AEGISLOG","AFFLE","AJANTPHARM",
    "ALKEM","ALKYLAMINE","AMARAJABAT","AMBER","ANGELONE",
    "APLAPOLLO","APOLLOTYRE","APTUS","ASTRAL","ATUL",
    "AUBANK","AUROPHARMA","AVANTIFEED","BAJAJHFL","BALRAMCHIN",
    "BATAINDIA","BAYERCROP","BBTC","BIKAJI","BLUESTARCO",
    "BRIGADE","CAMS","CANFINHOME","CARBORUNIV","CASTROLIND",
    "CCL","CDSL","CEATLTD","CENTURYPLY","CERA",
    "CHALET","CHROMATIC","CLEAN","COFORGE","CONCORDBIO",
    "CROMPTON","CSBBANK","CYIENT","DATAPATTNS","DELHIVERY",
    "DEVYANI","DIXON","DLINKINDIA","DOMS","ELGIEQUIP",
    "EMAMILTD","ENDURANCE","ENGINERSIN","EPL","EQUITASBNK",
    "ERIS","ESCORTS","EXIDEIND","FINEORG","FLUOROCHEM",
    "FORTIS","GLAND","GLAXO","GLENMARK","GMRINFRA",
    "GNFC","GODFRYPHLP","GPIL","GRINDWELL","GSFC",
    "GUJGASLTD","HAPPSTMNDS","HATSUN","HFCL","HIKAL",
    "HINDPETRO","HONAUT","HUDCO","IDFCFIRSTB","IEX",
    "IFBIND","IIFL","INDIANB","INDIAMART","INDIGO",
    "INOXWIND","IOB","IREDA","IRFC","ISEC",
    "JBCHEPHARM","JKCEMENT","JKLAKSHMI","JMFINANCIL","JOGINDR",
    "JUBLFOOD","JUBLINGREA","JUBLPHARMA","KALYANKJIL","KANSAINER",
    "KARURVYSYA","KIMS","KIOCL","KPIL","KPRMILL",
    "KRBL","LALPATHLAB","LATENTVIEW","LAURUSLABS","LICHSGFIN",
    "LINDEINDIA","LUXIND","MAHSEAMLES","MANAPPURAM","MASFIN",
    "MAXHEALTH","MCDOWELL-N","METROPOLIS","MFSL","MGL",
    "MOTILALOFS","MPHASIS","MRPL","NATCOPHARM","NAVINFLUOR",
    "NAUKRI","NBCC","NESCO","NLCINDIA","NOCIL",
    "NUVOCO","OFSS","OLECTRA","ORIENTELEC","PAGEIND",
    "PATELENG","PGHH","PHOENIXLTD","POLYMED","POONAWALLA",
    "POWERMECH","PRESTIGE","PRINCEPIPE","PRIVISCL","QUESS",
    "RADICO","RAILTEL","RAJRATAN","RAMCOCEM","RAYMOND",
    "RBLBANK","REDINGTON","RITES","ROSSARI","ROUTE",
    "SAFARI","SANOFI","SAPPHIRE","SCHAEFFLER","SHYAMMETL",
    "SIGNATURE","SJVN","SKFINDIA","SOBHA","SOLARA",
    "SONACOMS","STARHEALTH","STLTECH","SUDARSCHEM","SUMICHEM",
    "SUNTV","SUPRAJIT","SUPREMEIND","SURYAROSNI","SUZLON",
    "SYNGENE","TANLA","TASTYBITE","TATACHEM","TATACOMM",
    "TATAELXSI","TATATECH","TCNSBRANDS","TEAMLEASE","THYROCARE",
    "TIINDIA","TIMKEN","TIMETECHNO","TRIDENT","TRITURBINE",
    "UCOBANK","UJJIVANSFB","UNIONBANK","UNOMINDA","USHA",
    "UTIAMC","VAIBHAVGBL","VARDHACRLC","VGUARD","VINATIORGA",
    "VOLTAMP","VRLLOG","VSTIND","WABCOINDIA","WELCORP",
    "WELSPUNLIV","WHIRLPOOL","WINDLAS","YESBANK","ZFCVINDIA"
]

# ── NIFTY SMALLCAP 250 ────────────────────────────────────────────────────────
NIFTY_SMALLCAP = [
    "AARTIDRUGS","ABCAPITAL","ABFRL","ACCELYA","ACMESOLAR",
    "ADANIGAS","ADFFOODS","ADROITINFO","ADVENZYMES","AEGISCHEM",
    "AEKIFOODS","AFI","AGROPHOS","AHLEAST","AHMEDABADST",
    "AIAENG","AINDIA","AJMERA","AKZOINDIA","ALEMBICLTD",
    "ALEXISINST","ALICON","ALKALI","ALLCARGO","ALMONDZ",
    "ALOKINDS","ALPHAGEO","AMARAJABAT","AMJLAND","AMRUTANJAN",
    "ANCHORHCL","ANDHRPAP","ANDHRSUGAR","ANITAS","ANMOL",
    "ANURAS","APARINDS","APEX","APOLLOPIPE","APTECHT",
    "ARIHANTCAP","ARIHANTSUP","ARKADE","ARMANFIN","ARNAV",
    "ARROWGREEN","ARTSON","ARVIND","ARVSMART","ASAHIINDIA",
    "ASAL","ASALCBR","ASHAPURMIN","ASHIANA","ASHIMASYN",
    "ASIANTILES","ASKAUTOLTD","ASMTEC","ASTERDM","ASTRAMICRO",
    "ATFL","ATLASCYCLE","ATOMTECH","ATUL","ATULAUTO",
    "AUROPHARM","AUTOGLOBE","AUTOIND","AVTNPL","AXISCADES",
    "AYMSYNTEX","AZAD","BAFNAPH","BAJAJCON","BAJAJHIND",
    "BALAJITELE","BALMLAWRIE","BALPHARMA","BALRAMCHIN","BANARBEADS",
    "BANCOINDIA","BANSALAGRO","BASML","BCONCEPTS","BEDMUTHA",
    "BEML","BFINVEST","BGRENERGY","BHAGERIA","BHAGWATMIN",
    "BHARATAGRI","BHARATGEAR","BHARATRAS","BHARATWIRE","BHEL",
    "BHMWJAYAS","BICYCIND","BIGBLOC","BINANIIND","BIRLACABLE",
    "BLAL","BLKASHYAP","BLUECOAST","BMETRICS","BOCIND",
    "BORORENEW","BPCLRIGHT","BPCLTRUST","BRFL","BROOKS",
    "BSLIMITED","BURNPUR","CAMLINFINE","CANTABIL","CAPLIPOINT",
    "CAREERP","CARERATING","CASTEXTECH","CCHHL","CCL",
    "CELEBRITY","CENTENKA","CENTUM","CERA","CEREBRAINT",
    "CGPOWER","CHAKRABARTI","CHECKLIST","CHEMFAB","CHENNPETRO",
    "CHIL","CIEINDIA","CINELINE","CLNINDIA","CMSINFO",
    "CNOVAPETRO","COCHINSHIP","COMSYN","CONDOR","CONFIPET",
    "CONTROL","COSMOFILMS","COUNCODOS","CRAFTSMAN","CREATIVEYE",
    "CREDITACC","CROWN","CSLFINANCE","CUBEXTUB","CUPID",
    "CYIENTDLM","DAAWAT","DAMODARIND","DBCORP","DBSTOCKBRO",
    "DCMFINSERV","DCMNVL","DCMSHRIRAM","DCW","DEEPAKFERT",
    "DEEPAKNTR","DELTACORP","DHANUKA","DHRUV","DICHLOMET",
    "DIGISPICE","DISHTV","DIVGIITTS","DJML","DLINKINDIA",
    "DOLLEX","DOLLAR","DONEAR","DPSCLTD","DRC",
    "DREAM","DREDGECORP","DRREDDY","DSHIELD","DUCON",
    "DYNAMATECH","DYNACONS","EASEMYTRIP","ECLERX","EDELWEISS",
    "EIEL","EIDPARRY","EIHOTEL","ELFORGE","ELIN",
    "EMKAY","EMMBI","EMUDHRA","ENERGYDEV","ENIL",
    "EROSMEDIA","ESABINDIA","ESTER","ETHOSLTD","EVEREADY",
    "EVERESTIND","EXCEL","EXIDE","FCSSOFT","FDC",
    "FEDERALBNK","FERMENTA","FILATFASH","FINCABLES","FINOPB",
    "FINOLEX","FIVESTAR","FLAIR","FLEXITUFF","FLFL",
    "FOODSIN","FORCEMOT","GABRIEL","GAEL","GALAXYSURF",
    "GANESHHOUC","GANGOTRI","GARFIBRES","GARWARE","GAYAPROJ",
    "GDL","GEECEE","GEEKAY","GESHIP","GFLLIMITED",
    "GHCLTEXTIL","GICHSGFIN","GICRE","GILLETTE","GILLANDERS",
    "GINNIFILA","GKELEC","GLOBALVECT","GLOBUSSPR","GLODYNE",
    "GMBREW","GMDCLTD","GMMPFAUDLR","GNXINDIA","GOCOLORS",
    "GODHA","GODREJAGRO","GODREJIND","GOODLUCK","GPPL",
    "GRANULES","GRAVITA","GREENPLY","GRINDWELL","GRSE",
    "GSTL","GTPL","GUFICBIO","GULFOILLUB","GVKPIL",
    "HAPPYFORGE","HARDWYN","HARITSEATS","HCC","HCLIL",
    "HECPROJECT","HERITGFOOD","HFCL","HIMATSEIDE","HINDCOPPER",
    "HINDMOTORS","HINDOILEXP","HINDWAREAP","HIRECT","HMT",
    "HNDFDS","HOMEFIRST","HONASA","HPL","HSCL",
    "HTMEDIA","IBREALEST","ICEMAKE","ICRA","IDBI",
    "IDEALREAL","IGPL","IGL","IITL","IMAGICAA",
    "IMFA","IMPAL","INDBANK","INDHOTEL","INDIGOPNTS",
    "INDIAGLYCO","INDIAINFOLINE","INDNIPPON","INDO","INDORAMA",
    "INDOSTAR","INDOTHAI","INDSWFTLAB","INDUSTOWER","INFINITEC",
    "INGERRAND","INTELLECT","INTERARCH","INVENTURE","IOLCP",
    "IPCALAB","IRB","IRCON","ISFT","ITALICTD",
    "ITI","JAIBALAJI","JAICORPLTD","JAIKISAAN","JAMNAAUTO",
    "JAYAGROGN","JAYASWALS","JBMA","JCHAC","JETFREIGHT",
    "JFSL","JISLDVREQS","JKIL","JKPAPER","JKTYRE",
    "JLHL","JMCPROJECT","JOCIL","JOHNABRAHAM","JPPOWER",
    "JSLHISAR","JSWHL","JTEKINDLTD","JTLIND","JUBILANT",
    "JUNIPERHOTEL","JUPITER","JYOTISTRUC","KALAMANDIR","KALYANI",
    "KANCHI","KANPRPLAS","KARUTURI","KESORAMIND","KEYFINSERV",
    "KFINTECH","KHADIM","KHAITANLTD","KILITCH","KIRLFER",
    "KIRLPNU","KIRLOSENG","KITEX","KOLTEPATIL","KOPRAN",
    "KOTAKPSU","KPGREEN","KREBSBIO","KRSNAA","KSCL",
    "KSERASERA","KSHEMKA","KSOLVES","KUANTUM","LAKSHVILAS",
    "LASA","LATENTVIEW","LAXMIMACH","LEMONTREE","LGBBROSLTD",
    "LIBERTSHOE","LIKHITHA","LIMELIGHT","LINCOLN","LKPFIN",
    "LLOYDSME","LNDHHOTEL","LOGICIND","LOGXN","LORDSCHLO",
    "LOYAL","LSIL","LTFOODS","LTTS","LUMAXIND",
    "LUMAXTECH","LUXIND","MAFANG","MAFATLAL","MAGADSUGAR",
    "MAHABANK","MAHAPEXLTD","MAHASTEEL","MAHINDCIE","MANINDS",
    "MANORG","MANPASAND","MAPSOL","MARATHON","MARGOFIN",
    "MARINE","MASKINVEST","MATRIMONY","MAXESTATES","MAZDOCK",
    "MBECL","MBLINFRA","MCCHRYSTAL","MCNALLY","MEDICAMEQ",
    "MENONBE","METALFORGE","METROBRAND","MFSL","MGEL",
    "MICEL","MIDHANI","MITCON","MITTALCORP","MMFL",
    "MMTC","MOIL","MOLDTKPAC","MORARJEE","MOTISONS",
    "MPSLTD","MRPL","MSTCLTD","MUKANDLTD","MUKKA",
    "MUNJALSHOW","NAGARCONST","NAGAFERT","NATH","NATIONALUM",
    "NAUKRI","NAVKARCORP","NCLIND","NDGL","NDTV",
    "NECLIFE","NESCO","NETWORK18","NEULANDLAB","NIACL",
    "NIITLTD","NIITMTS","NILE","NITIRAJ","NKIND",
    "NLCINDIA","NOCIL","NRBBEARING","NSLNISP","NUTEK",
    "OCCL","OMAXE","ONELIFECAP","ONMOBILE","OPTIEMUS",
    "ORCHPHARMA","ORIENT","ORIENTBELL","ORIENTCEM","ORIENTPPR",
    "OSIAHYPER","OTCO","OZONE","PALASHSECU","PALREDTEC",
    "PANACEA","PANAMAPET","PANINDLTD","PAPERPROD","PARADEEP",
    "PARAS","PARASPETRO","PAREKH","PARSVNATH","PASUPTAC",
    "PATANJALI","PATINTLOG","PCJEWELLER","PDMJEPAPER","PDSL",
    "PEARLPOLY","PENINLAND","PENTAGOLD","PERSISTENT","PGEL",
    "PGINVIT","PGHL","PIL","PILANIINVS","PIONEEREMB",
    "PLASTIBLEN","PLATININD","PNBGILTS","PNBHOUSING","PODDARMENT",
    "POKARNA","POLYCAB","POLYMED","PONNISUGAR","POOJA",
    "POONAWALLA","POWERMECH","PPAP","PRAJIND","PRAKASHSTL",
    "PRECAM","PRECOT","PREMEXPLN","PREMIERPOL","PRESTIGE",
    "PRICOLLTD","PRINCEPIPE","PRISMJOINTS","PRITIKAUTO","PSPPROJECT",
    "PUNJABCHEM","PURVA","PVRINOX","QUICKHEAL","RADIANTCMS",
    "RAIN","RAJESHEXPO","RAJRATAN","RAJSREESUG","RALLIS",
    "RAMASTEEL","RAMCOIND","RAMCOSY","RAMKY","RATEGAIN",
    "RATNAMANI","RAYMOND","RBLBANK","RCF","RDBMS",
    "RPOWER","RESPONIND","REVATHI","RHFL","RICOAUTO",
    "RKDL","RKFORGE","RKREALTY","ROLCON","ROLEXRINGS",
    "RPGLIFE","RPOWER","RSSOFTWARE","RUBFILA","RUSHIL",
    "RUSTOMJEE","RVNL","SADBHAV","SADBHIN","SAGCEM",
    "SAHYADRI","SALONA","SAMHIHOTEL","SANGHIIND","SANGINITA",
    "SANMIT","SARDAEN","SASTASUNDR","SATIN","SAURASHTRA",
    "SAVITA","SBGLP","SBICARD","SCHAND","SCPL",
    "SEPC","SEQUENT","SFNL","SGBIOTEC","SHAHALLOYS",
    "SHALBY","SHANKARA","SHANTIGEAR","SHARDACROP","SHAREINDIA",
    "SHEKHAWATI","SHEMAROO","SHILPAMED","SHIVALIK","SHOPERSTOP",
    "SHREDIGCEM","SHREERAMA","SHREYAS","SHRIRAMFIN","SHYAMCENT",
    "SIGACHI","SIMPLEXINF","SKIPPER","SKMEGGPROD","SKYGOLD",
    "SMCGLOBAL","SMLISUZU","SNOWMAN","SOLARA","SOMANYCERA",
    "SOULINDIA","SOUTH","SOUTHBANK","SOUTHWEST","SPECIALITY",
    "SPENCERS","SPICEJET","SPORTKING","SPTL","SRHHYPOLTD",
    "SRTRANSFIN","SSWL","STAR","STCINDIA","STEELCAS",
    "STERTOOLS","STOVEKRAFT","SUBROS","SUDARSCHEM","SUMEDHA",
    "SUNFLAG","SUNTECK","SUPRIYA","SURANAT","SURYALAKSHMI",
    "SUVEN","SVMGLOB","SWANENERGY","SWSOLAR","SYMPHONY",
    "SYNCOMF","TAINWALCHM","TALBROAUTO","TANFAC","TARMAT",
    "TASTYBITE","TATAINVEST","TATAMETALI","TATASP","TATVA",
    "TCPLPACK","TECHNOE","TECILCHEM","TEMBO","TEXRAIL",
    "TFCILTD","THANGAMAYL","TIPSMUSIC","TIRUMALCHM","TITAGARH",
    "TKNSL","TMDEL","TNPETRO","TOKYOPLAST","TORNTPOWER",
    "TREK","TREEHOUSE","TRIL","TRIVENI","TTKHLTCARE",
    "TTKPRESTIG","TTML","TVSMOTOR","TVSSCS","TVTODAY",
    "UGARSUGAR","UJAAS","UKPBS","ULPL","UMANG",
    "UNIENTER","UNIPARTS","UNITDSPR","UNIVASTU","UNIVCABLES",
    "UPCL","URJA","USHAMART","UTINEXT","UTTAMSUGAR",
    "V2RETAIL","VAIBHAVGBL","VAKRANGEE","VALIANTLAB","VARDHACRLC",
    "VARDHMAN","VARROC","VASCONEQ","VENUSREM","VERANDA",
    "VESUVIUS","VGUARD","VIDHIING","VIKASECO","VIKASLIFE",
    "VIMTALABS","VINATIORGA","VINDHYATEL","VINYLINDIA","VIRINCHI",
    "VISESHINFO","VISHWARAJ","VIVIDHA","VLSFINANCE","VMARCIND",
    "VNIL","VOLTAS","VRAJ","VSTTILLERS","WAGONS",
    "WALCHANNAG","WATERBASE","WCLIND","WELENT","WELSPUNIND",
    "WENDT","WESTLIFE","WINDMACHINES","WINGS","WISEC",
    "XCHANGING","XPRO","YAARI","YATHARTH","YES",
    "YUGDECOR","ZENITHSTL","ZEOTACORP","ZESTMONEY","ZIMLAB",
    "ZODIAC","ZUARI","ZUARIIND"
]

# ── PSU / DEFENCE / RAILWAYS (popular theme) ──────────────────────────────────
PSU_DEFENCE = [
    "HAL","BEL","BDL","MIDHANI","GRSE","COCHINSHIP","MAZDOCK",
    "RVNL","IRFC","IRCTC","IRCON","RAILTEL","RITES","NBCC",
    "RECLTD","PFC","NTPC","NHPC","SJVN","PGCIL","COALINDIA",
    "NLCINDIA","NMDC","MOIL","NALCO","HINDCOPPER","KIOCL",
    "HUDCO","IREDA","NVIIT","PSUBNKBEES","CPSEETF"
]

# ── IT / TECH ─────────────────────────────────────────────────────────────────
IT_TECH = [
    "TCS","INFY","WIPRO","HCLTECH","TECHM","LTIM","LTTS",
    "MPHASIS","COFORGE","PERSISTENT","CYIENT","KPITTECH",
    "MASTEK","RATEGAIN","TANLA","INTELLECT","NEWGEN",
    "ZENSAR","BIRLASOFT","HAPPSTMNDS","LATENTVIEW","DATAMATICS"
]

# ── PHARMA / HEALTHCARE ───────────────────────────────────────────────────────
PHARMA = [
    "SUNPHARMA",
    "DRREDDY","CIPLA","DIVISLAB","APOLLOHOSP",
    "AUROPHARMA","LUPIN","GLAND","ALKEM","IPCALAB",
    "NATCOPHARM","GRANULES","LALPATHLAB","METROPOLIS","THYROCARE",
    "MAXHEALTH","FORTIS","SYNGENE","AJANTPHARM","LAURELUSLABS",
    "NEULANDLAB","JUBLPHARMA","SOLARA","PANACEA","SUVEN"
]

# ── BANKING & FINANCE ─────────────────────────────────────────────────────────
BANKING = [
    "HDFCBANK","ICICIBANK","SBIN","KOTAKBANK","AXISBANK",
    "INDUSINDBK","BANKBARODA","PNB","CANBK","UNIONBANK",
    "IDFCFIRSTB","FEDERALBNK","KARURVYSYA","RBLBANK","YESBANK",
    "BAJFINANCE","BAJAJFINSV","CHOLAFIN","MANAPPURAM","MUTHOOTFIN",
    "LICHSGFIN","POONAWALLA","SBICARD","ANGELONE","CDSL","CAMS"
]

# ── FMCG / CONSUMER ───────────────────────────────────────────────────────────
FMCG = [
    "HINDUNILVR","ITC","NESTLEIND","BRITANNIA","DABUR",
    "MARICO","COLPAL","GODREJCP","EMAMILTD","TATACONSUM",
    "VBL","RADICO","MCDOWELL-N","BIKAJI","PATANJALI",
    "GODFRYPHLP","VSTIND","GILLETTE","PGHH"
]

# ── AUTO ──────────────────────────────────────────────────────────────────────
AUTO = [
    "MARUTI","TATAMOTORS","M&M","BAJAJ-AUTO","HEROMOTOCO",
    "EICHERMOT","TVSMOTORS","ASHOKLEY","ESCORTS","MOTHERSON",
    "BOSCHLTD","EXIDEIND","AMARAJABAT","APOLLOTYRE","CEATLTD",
    "MRF","BALKRISIND","SUNDRMFAST","SCHAEFFLER","GABRIEL"
]

# ── INFRA / REAL ESTATE ───────────────────────────────────────────────────────
INFRA = [
    "LT","ADANIPORTS","ADANIGREEN","ADANIPOWER","DLF",
    "GODREJPROP","PRESTIGE","BRIGADE","SOBHA","PHOENIXLTD",
    "KOLTEPATIL","OBEROIRLTY","MAHINDCIE","IRB","KNRCON",
    "PNCINFRA","SADBHAV","NCC","HCC","JMCPROJECT"
]

# ── ALL SYMBOLS COMBINED ──────────────────────────────────────────────────────
CATEGORIES = {
    "NIFTY50":         NIFTY50,
    "NIFTYNext50":    NIFTY_NEXT50,
    "NIFTYMidcap150": NIFTY_MIDCAP,
    "NIFTYSmallcap":   NIFTY_SMALLCAP,
    "PSU/Defence":    PSU_DEFENCE,
    "IT/Tech":        IT_TECH,
    "Pharma":           PHARMA,
    "Banking&Finance":BANKING,
    "FMCG/Consumer":  FMCG,
    "AUTO":             AUTO,
    "Infra/Realty":   INFRA,
}

def get_symbols(selected_categories=None):
    """Return list of yfinance symbols (.NS) for selected categories."""
    if selected_categories is None:
        selected_categories = list(CATEGORIES.keys())
    seen = set()
    result = []
    for cat in selected_categories:
        for sym in CATEGORIES.get(cat, []):
            clean = sym.replace(" ", "").replace("&","") + ".NS"
            if clean not in seen:
                seen.add(clean)
                result.append(clean)
    return result
# print(get_symbols(["AUTO"]))

def get_all_symbols():
    return get_symbols(list(CATEGORIES.keys()))

# if __name__ == "__main__":
#     all_syms = get_all_symbols()
#     print(f"Total unique NSE symbols: {len(all_syms)}")
#     for cat, stocks in CATEGORIES.items():
#         print(f"  {cat}: {len(stocks)} stocks")


# ─────────────────────────────────────────────────────────────────────────────
# INDIAN INDICES — yfinance tickers + metadata
# ─────────────────────────────────────────────────────────────────────────────

INDEX_SYMBOLS = {
    # ── Broad Market ──────────────────────────────────────────────────────────
    "NIFTY50":          {"yf": "^NSEI",    "nse": "NIFTY",        "emoji": "🇮🇳",  "type": "broad",    "f_and_o": True,  "desc": "Top 50 large-cap NSE stocks"},
    "SENSEX":            {"yf": "^BSESN",   "nse": "SENSEX",       "emoji": "📈",  "type": "broad",    "f_and_o": False, "desc": "BSE 30 bellwether index"},
    "NIFTY NEXT 50":     {"yf": "^NSMIDCP", "nse": "NIFTYNXT50",   "emoji": "📊",  "type": "broad",    "f_and_o": False, "desc": "Next 50 large-caps after NIFTY 50"},
    "NIFTY 100":         {"yf": "^CNX100",  "nse": "NIFTY100",     "emoji": "💯",  "type": "broad",    "f_and_o": False, "desc": "Top 100 companies by market cap"},
    "NIFTY 200":         {"yf": "^CNX200",  "nse": "NIFTY200",     "emoji": "📋",  "type": "broad",    "f_and_o": False, "desc": "Top 200 NSE companies"},
    "NIFTY 500":         {"yf": "^CRSLDX",  "nse": "NIFTY500",     "emoji": "🌐",  "type": "broad",    "f_and_o": False, "desc": "Broad market — top 500"},

    # ── Sectoral ──────────────────────────────────────────────────────────────
    "NIFTY BANK":        {"yf": "^NSEBANK", "nse": "BANKNIFTY",    "emoji": "🏦",  "type": "sector",   "f_and_o": True,  "desc": "Top 12 banking stocks — most traded F&O index"},
    "NIFTY IT":          {"yf": "^CNXIT",   "nse": "NIFTYIT",      "emoji": "💻",  "type": "sector",   "f_and_o": False, "desc": "Top IT companies: TCS, Infosys, HCL, Wipro"},
    "NIFTY PHARMA":      {"yf": "^CNXPHARMA","nse": "NIFTYPHARMA", "emoji": "💊",  "type": "sector",   "f_and_o": False, "desc": "Top pharma & healthcare stocks"},
    "NIFTY AUTO":        {"yf": "^CNXAUTO", "nse": "NIFTYAUTO",    "emoji": "🚗",  "type": "sector",   "f_and_o": False, "desc": "Auto sector: Maruti, Tata Motors, M&M"},
    "NIFTY FMCG":        {"yf": "^CNXFMCG", "nse": "NIFTYFMCG",   "emoji": "🛒",  "type": "sector",   "f_and_o": False, "desc": "FMCG: HUL, ITC, Nestle, Dabur"},
    "NIFTY METAL":       {"yf": "^CNXMETAL","nse": "NIFTYMETAL",   "emoji": "⚙️",  "type": "sector",   "f_and_o": False, "desc": "Metal & mining: Tata Steel, Hindalco, JSW"},
    "NIFTY ENERGY":      {"yf": "^CNXENERGY","nse":"NIFTYENERGY",  "emoji": "⚡",  "type": "sector",   "f_and_o": False, "desc": "Energy: ONGC, BPCL, Power Grid, NTPC"},
    "NIFTY REALTY":      {"yf": "^CNXREALTY","nse":"NIFTYREALTY",  "emoji": "🏗️",  "type": "sector",   "f_and_o": False, "desc": "Real estate: DLF, Godrej, Oberoi"},
    "NIFTY MEDIA":       {"yf": "^CNXMEDIA", "nse":"NIFTYMEDIA",   "emoji": "📺",  "type": "sector",   "f_and_o": False, "desc": "Media & entertainment"},
    "NIFTY PSU BANK":    {"yf": "^CNXPSUBANK","nse":"NIFTYPSUBANK","emoji": "🏛️",  "type": "sector",   "f_and_o": False, "desc": "Public sector banks: SBI, PNB, BOB"},
    "NIFTY FINSERVICE":  {"yf": "^CNXFINANCE","nse":"FINNIFTY",    "emoji": "💰",  "type": "sector",   "f_and_o": True,  "desc": "Financial services — F&O traded"},
    "NIFTY INFRA":       {"yf": "^CNXINFRA", "nse":"NIFTYINFRA",   "emoji": "🏗️",  "type": "sector",   "f_and_o": False, "desc": "Infrastructure sector index"},

    # ── Mid/Small Cap ─────────────────────────────────────────────────────────
    "NIFTY MIDCAP 50":   {"yf": "^NSEMDCP50","nse":"MIDCAP50",     "emoji": "📈",  "type": "midsmall", "f_and_o": False, "desc": "Top 50 midcap stocks"},
    "NIFTY MIDCAP 100":  {"yf": "^CNX500",   "nse":"MIDCAP100",    "emoji": "📊",  "type": "midsmall", "f_and_o": False, "desc": "Top 100 midcap stocks"},
    "NIFTY SMALLCAP 100":{"yf": "^CNXSC",    "nse":"SMALLCAP100",  "emoji": "🔹",  "type": "midsmall", "f_and_o": False, "desc": "Top 100 smallcap stocks"},
    "NIFTY MIDCAP SELECT":{"yf":"^NSMIDCP",  "nse":"MIDCPNIFTY",   "emoji": "🎯",  "type": "midsmall", "f_and_o": True,  "desc": "Midcap Select — F&O traded index"},

    # ── Volatility ────────────────────────────────────────────────────────────
    "INDIA VIX":         {"yf": "^INDIAVIX", "nse": "INDIAVIX",    "emoji": "⚡",  "type": "volatility","f_and_o": False, "desc": "India fear gauge — high = fear, low = complacency"},
}

# F&O eligible indices (have options chain on NSE)
FO_INDICES = {k: v for k, v in INDEX_SYMBOLS.items() if v["f_and_o"]}

# Group for display
INDEX_GROUPS = {
    "🌐 Broad Market":   [k for k,v in INDEX_SYMBOLS.items() if v["type"]=="broad"],
    "🏭 Sectoral":       [k for k,v in INDEX_SYMBOLS.items() if v["type"]=="sector"],
    "📊 Mid & Small Cap":[k for k,v in INDEX_SYMBOLS.items() if v["type"]=="midsmall"],
    "⚡ Volatility":     [k for k,v in INDEX_SYMBOLS.items() if v["type"]=="volatility"],
}

def get_index_yf_symbol(index_name: str) -> str:
    """Return yfinance symbol for an index name."""
    return INDEX_SYMBOLS.get(index_name, {}).get("yf", "")

def get_index_nse_symbol(index_name: str) -> str:
    """Return NSE API symbol for an index name."""
    return INDEX_SYMBOLS.get(index_name, {}).get("nse", "")

def is_fo_index(index_name: str) -> bool:
    """True if index has F&O options on NSE."""
    return INDEX_SYMBOLS.get(index_name, {}).get("f_and_o", False)




def search_symbols(query: str="", limit: int = 10) -> list[dict]:
    

    if not query or not query.strip():
        return []

    q = query.strip().upper()

    seen    = set()
    results = []

    def _add(symbol, display, category, type_="stock"):
        key = symbol.upper()
        if key not in seen:
            seen.add(key)
            results.append({
                "symbol":   symbol,
                "display":  display,
                "category": category,
                "type":     type_,
            })

    # ── 1. Search indices first (higher priority) ──────────────────────────
    # for name, meta in INDEX_SYMBOLS.items():
    #     nse = meta["nse"].upper()
    #     yf  = meta["yf"].upper().lstrip("^")
    #     if name.upper().startswith(q) or nse.startswith(q) or yf.startswith(q):
    #         _add(
    #             symbol   = meta["yf"],
    #             display  = f"{meta['emoji']} {name}",
    #             category = "Index",
    #             type_    = "index",
    #         )

    # ── 2. Search all stock categories ────────────────────────────────────
    for cat, symbols in CATEGORIES.items():
        for sym in symbols:
            if sym.upper().startswith(q):
                _add(
                    symbol   = sym + ".NS",
                    display  = sym,
                    category = cat,
                    type_    = "stock",
                )

    # ── 3. If query is mid-string (e.g. "BANK") also match contains ───────
    if len(results) < 5:
        for cat, symbols in CATEGORIES.items():
            for sym in symbols:
                if q in sym.upper() and sym + ".NS" not in seen:
                    _add(
                        symbol   = sym + ".NS",
                        display  = sym,
                        category = cat,
                        type_    = "stock",
                    )
        # for name, meta in INDEX_SYMBOLS.items():
        #     if q in name.upper() and meta["yf"] not in seen:
        #         _add(
        #             symbol   = meta["yf"],
        #             display  = f"{meta['emoji']} {name}",
        #             category = "Index",
                #     type_    = "index",
                # )

    return results[:limit]
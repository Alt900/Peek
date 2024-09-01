import alpaca.data
from . import filesystem,args
from . import pd, os, json
from alpaca.data import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from datetime import datetime
import alpaca

cwd=os.getcwd()
data={}


def _downloader(ticker,timeframe):
    __client = StockHistoricalDataClient(args["alpaca_key"],args["alpaca_secret"])
    try:
        data=json.loads(__client.get_stock_bars(
            StockBarsRequest(
                symbol_or_symbols=ticker,
                timeframe=timeframe,
                start=datetime(*args["from"]),
                end=datetime(*args["to"])
            )
        ).json())["data"][ticker]
        print(type(data))
        print(data[0:40])
        with open(f"{ticker}_data.json","w+") as F:
            json.dump(data,F)
    except AttributeError:
        print(f"Could not download data for {ticker}, skipping")

def FetchJSON(ticker):
    with open(f"{ticker}_data.json","r") as F:
        return json.load(F)

def load(timeframe=alpaca.data.timeframe.TimeFrame.Minute):
    tickers=args["tickers"]
    DataDirectory=cwd+f"{filesystem}react_gui{filesystem}public{filesystem}Assets{filesystem}MarketData"
    os.chdir(DataDirectory)
    print(os.getcwd())

    #check for cache arg and cached files
    Cached=[x.split("_")[0] for x in os.listdir(DataDirectory)]
    if not(args["Omit_Cache"]):
        if len(Cached)>0:
            todownload=[x for x in tickers if x not in Cached]
            print(f"Found pre-existing data for the following tickers, skipping them:\n{Cached}.")
        else:
            print(f"No pre-existing data found for the following tickers:\n{tickers}.")
            todownload=tickers
    else:
        todownload=tickers
        print(f"Found pre-existing data for the following tickers, cache omitted, overwriting existing data for:\n{Cached}.")

    print(f"---\n\n{tickers}\n\n---")

    if len(todownload)>0:
        print("Downloading...")
        for x in todownload:
            data[x]=_downloader(x,timeframe=timeframe)
        print("Download complete.")
    else:
        print("No tickers found to scrape data for, passing download.")

    files=[x for x in os.listdir(DataDirectory) if not(any([x.endswith(".py"),x.endswith(".ini")]))]
    on_hand=[x for x in data]
    for file,ticker in zip(files,tickers):
        if ticker in on_hand:
            continue
        df = pd.read_json(file, orient ='split', compression = 'infer')
        data[ticker]=df

    os.chdir(cwd)
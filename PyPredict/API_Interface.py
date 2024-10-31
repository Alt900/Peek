from . import pd, os, json, filesystem
from datetime import datetime, timezone
import requests

data={}

DataDirectory=os.getcwd()+f"{filesystem}MarketData"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0"
}

session = requests.Session()

class DataHandler():
    def __init__(self):
        self.OnHand = []
        self.HistoricalDataURL = "https://query1.finance.yahoo.com/v8/finance/chart/"
        self.NewsURL = "https://query2.finance.yahoo.com/v1/finance/search?q="
        for filename in [x for x in os.walk(DataDirectory)][0][2]:
            self.OnHand.append(filename.split("_")[0])
        
    def DownloadTickerData(self,tickers,start,end):
        if(start != None and end != None):
            start = int(datetime.strptime(start,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp())
            end = int(datetime.strptime(end,"%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp())
        for ticker in tickers:
            if ticker not in self.OnHand:
                response = session.get(
                    f"{self.HistoricalDataURL}{ticker}?period1={start}&period2={end}&interval=1d",headers=headers
                )
                if response.status_code == 200:
                    dataresp = response.json()
                    timestamps = dataresp['chart']['result'][0]['timestamp']
                    indicators = dataresp['chart']['result'][0]['indicators']['quote'][0]
                    df = pd.DataFrame({
                        "timestamp":pd.to_datetime(timestamps,unit='s'),
                        "open":indicators['open'],
                        "high":indicators['high'],
                        "low":indicators['low'],
                        "close":indicators['close'],
                        "volume":indicators['volume']
                    })
                    data[ticker]=df
                    df.to_json(f"{DataDirectory}{filesystem}{ticker}_data.json", orient='records', date_format='iso', lines=False)
                else:
                    print(f"Error fetching {ticker} data, GET returned status code: {response.status_code}")

            else:
                data[ticker]=pd.read_json(f"{DataDirectory}{filesystem}{ticker}_data.json", orient='records', lines=False)

    def GetArticles(self,tickers):
        for ticker in tickers:
            response = session.get(f"{self.NewsURL}{ticker}",headers=headers)
            if response.status_code == 200:
                yield response.json()
            else:
                print(f"Error fetching {ticker} news, GET returned status code: {response.status_code}")
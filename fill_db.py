#run to fill the database of the web app with randome observations from Data_TPE_stagiaire.xlsx by randome users
import pickle as pk 
import warnings
import json
from sklearn.exceptions import DataConversionWarning
from pandas.errors import SettingWithCopyWarning
warnings.filterwarnings(action='ignore', category=DataConversionWarning)
warnings.filterwarnings(action='ignore', category=SettingWithCopyWarning)
warnings.filterwarnings(action='ignore', category=FutureWarning)
import pandas as pd
from random import randint
import pandas as pd
import pymongo
import datetime
from random import choice
import math

def tr(value):
    factor = 10 ** 2  # Two decimal places
    truncated_value = math.trunc(value * factor) 
    return truncated_value
#calculer les ratios necessaires
def cal_ratios(df):
    df_cal=pd.DataFrame(index=df.index)
    df_cal['solvabilite']=df['CAP_PROP']/df['TOT_BL']
    df_cal['liq_immediate']=(df['LIQ'])/df['PASS_COURANT']
    df_cal['equilibire']=df['FR']/df['BFR']
    df_cal['rot_cap_prop']=df['CA']/df['CAP_PROP']
    df_cal['roe']=df['RN']/df['CAP_PROP']
    df_cal['rot_actif']=df['CA']/df['TOT_BL']
    df_cal['marge_net']=df['RN']/df['CA']
    df_cal['liq_cour']=(df['ACT_COURANT'])/df['PASS_COURANT']
    df_cal['aut_fin']=df['CAP_PROP']/(df['CAP_PROP']+df['DS'])
    df_cal['couv_det']=df['DS']/df['CFN']
    df_cal['leverage_financier']=df['PASS_COURANT']/df['CAP_PROP']
    df_cal['endettement']=df['DS']/df['FPN']
    return df_cal


client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['predictions']
list_users=[]
users=db.users.find()
for user in users:
    list_users.append(user['username'])
model=pk.load(open(r'C:\Users\malek\Desktop\pfe_1\machine learning\model_nn.pkl','rb'))
#importer dataframe ( les variables que je vais utiliser ) et calculer les ratios moi meme
needed_features=['NUM_CLT','CAP_PROP','TOT_BL','LIQ','PASS_COURANT','FR','BFR','CA','RN','ACT_COURANT','DS','CFN','FPN','DEFAUT']
data=pk.load(open(r'C:\Users\malek\Desktop\pfe_1\machine learning\original_df.pickle','rb'))
print(data['description'])
df=data['dataframe'][needed_features]
df['NUM_CLT']=df['NUM_CLT'].map(lambda x :x[3:])
randindex=[randint(0,7720) for i in range(5)]
x=df.iloc[randindex,0:-1]
res=[]
for i in range(5):
    q=cal_ratios(pd.DataFrame(x.iloc[i,:]).transpose())
    prediction=tr(model.predict_proba(q)[0][1])
    doc={'username':choice(list_users),'num_clt':x.iloc[i,:][0],'ca': x.iloc[i,:][7], 
        'rn': x.iloc[i,:][8],'cfn':x.iloc[i,:][11],
        'fpn':x.iloc[i,:][12],'ds':x.iloc[i,:][10],
        'liq':x.iloc[i,:][3],'bfr':x.iloc[i,:][6],
        'fr':x.iloc[i,:][5],'cap_prop':x.iloc[i,:][1],
        'tot_bil':x.iloc[i,:][2],'pas':x.iloc[i,:][4],
        'act':x.iloc[i,:][9] ,'day':datetime.date.today().strftime("%d/%m/%Y"),
        'time':datetime.datetime.now().strftime("%H:%M"),'proba':prediction}
    res.append(doc)
db.predictions.insert_many(res)
print('rows added')

    
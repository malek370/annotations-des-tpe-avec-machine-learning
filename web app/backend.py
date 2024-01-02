from flask import Flask,request,jsonify,render_template,redirect ,url_for ,session
from flask_cors import CORS
import pickle 
import pandas as pd
import pymongo
import datetime
import json
from bson import ObjectId
import numpy as np
import math

def tr(value):
    factor = 10 ** 2  # Two decimal places
    truncated_value = math.trunc(value * factor)
    return truncated_value
def json_util(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, list):
        return [json_util(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: json_util(value) for key, value in obj.items()}
    else:
        return obj
    
model=pickle.load(open(r'C:\Users\malek\Desktop\pfe1\machine learning\model_nn.pkl','rb'))
app=Flask(__name__)
CORS(app)
app.secret_key = 'your-secret-key'
client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client['predictions']

@app.route('/home')
def home():
    if not 'user_id' in session:
            return redirect(url_for('login_page'))
    if session.get('role')=='1':
        return render_template('indexad.html')
    return render_template('index.html')

@app.route('/')
def login_page():
    if not 'user_id' in session:
            return render_template('login.html')
    return redirect(url_for('home'))

@app.route('/form')
def form():
        if not 'user_id' in session:
            return redirect(url_for('login_page'))
        if session.get('role')=='1':
            return render_template('formad.html')
        return render_template('form.html',result=None)

@app.route('/login',methods=['POST'])
def login():
     user = request.json['user']
     pwd = request.json['pwd']
     res=db.users.find_one({'username':user,'password':pwd})
     if(not res==None):
         session['user_id'] = user 
         session['role']=res['isadmin']
         return jsonify({'status':'1','message':'utilisateur trouve','url':'/home'})
     else :
         return jsonify({'status':'0','message':'utilisateur introuvable'})

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('role', None)
    return redirect(url_for('login_page'))

@app.route('/predict',methods=['POST'])
def score():
    num_clt=request.json['NUM_CLT']
    ca=float(request.json['CA'])
    rn=float(request.json['RN'])
    cfn=float(request.json['CFN'])
    fpn=float(request.json['FPN'])
    ds=float(request.json['DS'])
    liq=float(request.json['LIQ'])
    bfr=float(request.json['BFR'] )   
    fr=float(request.json['FR'])
    cap_prop=float(request.json['CAP_PROP'])
    tot_bl=float(request.json['TOT_BL'])
    pas=float(request.json['PAS'])
    act=float(request.json['ACT'])
    day=datetime.date.today().strftime("%d/%m/%Y")
    time=datetime.datetime.now().strftime("%H:%M")
    #--- calculer ratios
    try:
        sol=cap_prop/tot_bl
    except ZeroDivisionError:
        sol = np.nan
        
    try:
        liq_im=liq/pas
    except ZeroDivisionError:
        liq_im = np.nan
        
    try:
        eq=fr/bfr
    except ZeroDivisionError:
        eq = np.nan
        
    try:
        rot_cap_prop=ca/cap_prop
    except ZeroDivisionError:
        rot_cap_prop = np.nan
        
    try:
        roe=rn/cap_prop
    except ZeroDivisionError:
        roe = np.nan
        
    try:
        rot_act=ca/tot_bl
    except ZeroDivisionError:
        rot_act = np.nan
        
    try:
        marge_net=rn/ca
    except ZeroDivisionError:
        marge_net = np.nan
        
    try:
        liq_cour=act/pas
    except ZeroDivisionError:
        liq_cour = np.nan
        
    try:
        aut_fin=cap_prop/(cap_prop+ds)
    except ZeroDivisionError:
        aut_fin = np.nan
        
    try:
        couv=ds/cfn
    except ZeroDivisionError:
        couv = np.nan
        
    try:
        lev=pas/cap_prop
    except ZeroDivisionError:
        lev = np.nan
        
    try:
        end=ds/fpn
    except ZeroDivisionError:
        end = np.nan
        
    q=pd.DataFrame({'solvabilite':[sol], 'liq_immediate':[liq_im], 'equilibire':[eq], 'rot_cap_prop':[rot_cap_prop], 'roe':[roe],
       'rot_actif':[rot_act], 'marge_net':[marge_net], 'liq_cour':[liq_cour], 'aut_fin':[aut_fin], 'couv_det':[couv],
       'leverage_financier':[lev], 'endettement':[10]})
    prediction=tr(model.predict_proba(q)[0][1])
    db.predictions.insert_one({'num_clt':num_clt,'ca': ca, 'rn': rn,'cfn':cfn,'fpn':fpn,'ds':ds,'liq':liq,'bfr':bfr,
                               'fr':fr,'cap_prop':cap_prop,'tot_bil':tot_bl,'pas':pas,'act':act ,'day':day,'time':time,'proba': prediction})

    return jsonify({"result": prediction})

    """if prediction==1:
        return 'un defaut bancaire est predit'
    else:
        return 'pas de defaut bancaire predit'"""

@app.route('/history')
def history():
    if not 'user_id' in session:
            return redirect(url_for('login_page'))
    if session.get('role')=='1':
        return render_template('historyad.html')
    return render_template('history.html')

@app.route('/history/recent')
def history_data_recent():
    if session.get('role')=='1':
        predictions = list(db.predictions.find().sort('_id',-1))
    else:
        predictions = list(db.predictions.find({'username':session.get('user_id')}).sort('_id',-1))
    prediction_data_json = json.loads(json.dumps(json_util(predictions)))
    return prediction_data_json

@app.route('/history/data')
def history_data_encient():
    predictions = list(db.predictions.find({'username':session.get('user_id')}).sort('_id',1))
    prediction_data_json = json.loads(json.dumps(json_util(predictions)))
    return prediction_data_json

@app.route('/history/defaut')
def history_data_defaut():
    if session.get('role')=='1':
        predictions = list(db.predictions.find().sort([('proba',-1),('_id',-1)]))
    else:
        predictions = list(db.predictions.find({'username':session.get('user_id')}).sort([('proba',-1),('_id',-1)]))
    prediction_data_json = json.loads(json.dumps(json_util(predictions)))
    return prediction_data_json

@app.route('/history/nondefaut')
def history_data_nondefaut():
    if session.get('role')=='1':
        predictions = list(db.predictions.find().sort([('proba',1),('_id',-1)]))
    else:
        predictions = list(db.predictions.find({'username':session.get('user_id')}).sort([('proba',1),('_id',-1)]))
    prediction_data_json = json.loads(json.dumps(json_util(predictions)))
    return prediction_data_json

@app.route('/history/delete/<doc>',methods=['DELETE'])
def delete_doc(doc):
    try:
        result = db.predictions.delete_one({'_id': ObjectId(doc)})
        return jsonify({'message': 'enregistrement supprime avec succee'})
    except pymongo.errors.PyMongoError as e:
        return jsonify({'message':'erreur !'})
    
@app.route('/users/get')
def get_users():
    users = list(db.users.find({"isadmin":'0'}))
    prediction_data_json = json.loads(json.dumps(json_util(users)))
    return prediction_data_json

@app.route('/users')
def users_page():
    if not 'user_id' in session:
            return redirect(url_for('login_page'))
    if session.get('role')=='1':
        return render_template('users.html')
    return redirect(url_for('home'))

@app.route('/users/delete/<doc>',methods=['DELETE'])
def delete_doc_user(doc):
    try:
        db.users.delete_one({'_id': ObjectId(doc)})
        return jsonify({'message': 'enregistrement supprime avec succee'})
    except pymongo.errors.PyMongoError as e:
        return jsonify({'message':'erreur !'})

@app.route('/user/create',methods=['POST'])
def create_user():
    user = request.json['user']
    pwd = request.json['pwd']
    try:
        rech=db.users.find_one({'username':user})
        if not rech==None:
            return jsonify({'message':'utilisateur deja exisite'})
        else:
            db.users.insert_one({'username':user,'password':pwd,'isadmin':'0'})
            return jsonify({'message':'utilisateur cree avec succee'})
    except pymongo.errors.PyMongoError as e:
        return jsonify({'message':'erreur !'})
    
if __name__=='__main__':
    app.run(port=3002)






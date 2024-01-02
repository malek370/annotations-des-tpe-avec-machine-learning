login = document.getElementById('login');
login.addEventListener('click', () => {

    
    var user = document.getElementById('username').value;
    var pwd = document.getElementById('password').value;
    if(pwd==='' || user===''){alert('valeur(s) manquante(s)');}
    else{var xhr = new XMLHttpRequest();
    xhr.open('POST', '/login');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        console.log(xhr.status);
        if(xhr.status==200){
            res=JSON.parse(xhr.response);
            if(res['status']=='0'){alert(res['message']);}
            else{window.location.href=res['url'];}
        }    
        else {console.log('erreur serveur');}
        
    };
    xhr.send(JSON.stringify({'pwd':pwd,'user':user}));
    }

});
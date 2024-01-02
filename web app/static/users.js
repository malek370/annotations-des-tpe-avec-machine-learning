let data;
const searchInput=document.getElementById('searchID');
const table = document.getElementById("table");

function print_element(element) {
    
    let row = '<tr class="table-warning" id="' + element._id + '">' +
        '<td class="mt-4">' + element.username + '</td>' +
        '<td>' + element.password + '</td>' +
        '<td><button class="btn btn-danger text-center delete-row" data-id="' + element._id + '">SUPPRIMER</button></td>' +
        '</tr>';
    table.insertAdjacentHTML("beforeend", row);

}

function creat_events_delete() {
    deleteButtons = document.querySelectorAll(".delete-row");
    deleteButtons.forEach(button => {
        button.addEventListener("click", function () {
            const rowId = button.getAttribute("data-id");
            deleteRow(rowId);
        });
    })
}

function deleteRow(rowId) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `/users/delete/${rowId}`);
    xhr.onload = function () {
        if (xhr.status === 200) {
            let row1 = document.getElementById(rowId).closest("tr");
            table.deleteRow(row1.rowIndex);
            alert("Row deleted successfully.");
        } else {
            alert("Failed to delete row.");
        }
    };
    xhr.send();
}



function print_all() {
    const children = table.childNodes;
    if (children.length > 2) {
        for (let i = children.length - 1; i > 1; i--) {
            table.removeChild(children[i]);
        }
    }
    data.forEach(element => {
        print_element(element);
    });
    creat_events_delete();
}

async function get_users() {
    searchInput.value = "";
    try {
        const res = await fetch('/users/get')
        const parseddata = await res.json()  
        data = parseddata;
        print_all();
    } catch (error) {
        console.log(error);
    }  
}

login = document.getElementById('ajouter');
login.addEventListener('click', () => {

    
    var user = document.getElementById('username').value;
    var pwd = document.getElementById('password').value;
    if(pwd==='' || user===''){alert('valeur(s) manquante(s)');}
    else{var xhr = new XMLHttpRequest();
    xhr.open('POST', '/user/create');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        console.log(xhr.status);
        if(xhr.status==200){
            res=JSON.parse(xhr.response);
            console.log(res);
            alert(res['message']);
            get_users();
            reset_form();
        }    
        else {console.log('erreur serveur');}
        
    };
    xhr.send(JSON.stringify({'pwd':pwd,'user':user}));
    }

});
const img = document.getElementById('logo');
img.addEventListener('click', function () {
    window.location.href = '/home';
});

function reset_form(){
    var pwd = document.getElementById('password');
    var user = document.getElementById('username');
    pwd.blur();
    user.blur();
}

searchInput.addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        let searchTerm = event.target.value;
        const children = table.childNodes;
        if (children.length > 2) {
            for (let i = children.length - 1; i > 1; i--) {
                table.removeChild(children[i]);
            }
        }
            data.forEach(element => {
                if (element.username == searchTerm || searchInput.value.length == 0)
                    print_element(element);
            });
        
        searchInput.blur();
    }
});
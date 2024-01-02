const searchInput = document.getElementById('searchID');
let deleteButtons;
let data;
const table = document.getElementById("table");
const filter = document.getElementById('filter');
function remove_current_filter(current_filter) {
    filter.innerText = current_filter;
    const children = table.childNodes;
    if (children.length > 2) {
        for (let i = children.length - 1; i > 1; i--) {
            table.removeChild(children[i]);
        }
    }
}
async function get_history_recent() {
    remove_current_filter('plus recent');
    searchInput.value = "";
    try {
        const res = await fetch('/history/recent')
        const parseddata = await res.json()  
        data = parseddata;
        
    } catch (error) {
        console.log(error)
    }  
    // .then(response => response.json())
    //     .then(parsedData => {

    //         data = parsedData;
    //         print_all();
    //     })
        // .catch(error => console.error(error));
}



function get_history_encient() {
    remove_current_filter('plus encient');
    searchInput.value = "";

    fetch('/history/encient')
        .then(response => response.json())
        .then(parsedData => {
            data = parsedData;
            print_all();
        })
        .catch(error => console.error(error));
}

function get_history_defaut() {
    remove_current_filter('defaut');
    searchInput.value = "";

    fetch('/history/defaut')
        .then(response => response.json())
        .then(parsedData => {
            data = parsedData;
            print_all();
        })
        .catch(error => console.error(error));
}

function get_history_nondefaut() {
    remove_current_filter('non defaut');
    searchInput.value = "";

    fetch('/history/nondefaut')
        .then(response => response.json())
        .then(parsedData => {
            data = parsedData;
            print_all();
        })
        .catch(error => console.error(error));
}
//get_history();

function print_element(element) {
    
    let row = '<tr class="table-warning" id="' + element._id + '">' +
        '<td class="mt-4">' + element.num_clt + '</td>' +
        '<td>' + element.day + '</td>' +
        '<td>' + element.time + '</td>' +
        '<td>' +
        '<button class="btn btn-secondary dropdown-toggle details no-hover" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
        'plus de details' +
        '</button>' +
        '<ul class="dropdown-menu">' +
        '<li>CHIFFRE D\'AFFAIRES &nbsp; &nbsp;' + element.ca + '</li>' +
        '<li >PASSIF  &nbsp; &nbsp;' + element.pas + '</li>' +
        '<li >ACTIF &nbsp; &nbsp;' + element.act + '</li>' +
        '<li >TOTAL BILAN &nbsp; &nbsp;' + element.tot_bil + '</li>' +
        '<li >CAPITAUX PROPRE &nbsp; &nbsp;' + element.cap_prop + '</li>' +
        '<li >FOND DE ROULEMENT &nbsp; &nbsp;' + element.fr + '</li>' +
        '<li >BFR &nbsp; &nbsp;' + element.bfr + '</li>' +
        '<li >LIQUIDITE &nbsp; &nbsp;' + element.liq + '</li>' +
        '<li >DETTES STRUCTURE &nbsp; &nbsp;' + element.ds + '</li>' +
        '<li >CASH-FLOW NET &nbsp; &nbsp;' + element.cfn + '</li>' +
        '<li >RESULTA NET  &nbsp; &nbsp;' + element.rn + '</li>' +
        '<li >FONDS PROPRES &nbsp; &nbsp;' + element.fpn + '</li>' +
        '</ul>' +
        '</td>' +
        '<td>' + element.proba + '%</td>' +
        '<td><button class="btn btn-danger text-center delete-row" data-id="' + element._id + '">SUPPRIMER</button></td>' +
        '</tr>';
    table.insertAdjacentHTML("beforeend", row);

}

function print_all() {

    data.forEach(element => {
        print_element(element);
    });
    creat_events_delete();
}

function tester() {
    console.log('tester passage');
    console.log(data);
    console.log(typeof (data));
}

searchInput.addEventListener('input', (event) => {
    let searchTerm = event.target.value;
    if (isNaN(searchTerm)) {
        searchInput.classList.add('is-invalid');
    } else {
        searchInput.classList.remove('is-invalid');

    }
});

searchInput.addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        let searchTerm = event.target.value;
        if (isNaN(searchTerm)) {
            searchInput.classList.add('is-invalid');
        } else {
            searchInput.classList.remove('is-invalid');
            remove_current_filter(filter.innerText);
            data.forEach(element => {
                if (element.num_clt == searchTerm || searchInput.value.length == 0)
                    print_element(element);
            });
        }
        searchInput.blur();
    }
});
const img = document.getElementById('logo');
img.addEventListener('click', function () {
    window.location.href = '/home';
});

function creat_events_delete() {
    deleteButtons = document.querySelectorAll(".delete-row");
    deleteButtons.forEach(button => {
        button.addEventListener("click", function () {
            const rowId = button.getAttribute("data-id");
            deleteRow(rowId);
        });
    })
}

// Function to delete a row
function deleteRow(rowId) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", `/history/delete/${rowId}`);
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
// Use JavaScript to validate the input fields

const form = document.getElementById('prediction-form');
const predict = document.getElementById('predict');
predict.addEventListener('click', function (event) {
  //event.preventDefault();
  let valid = true;
  for (const input of form.elements) {
    if (input.type === 'text') {
      const value = Number(input.value || input.value=='');
      if (isNaN(value)) {
        input.classList.add('is-invalid');
        valid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    }
  }
  if (valid) {
    // Submit the form if all fields are valid
    //alert('submited');
    //form.submit();
    get_prediction();
  }
  else {
    alert('mauvaise(s) valeur(s) trouvée(s)');
  }
});

// Add event listeners to the input fields to validate them when their value changes
const inputs = form.querySelectorAll('input[type="text"]');
inputs.forEach(input => {
  input.addEventListener('input', () => {
    const value = Number(input.value);
    if (isNaN(value)) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  });
});
// Define a function to reset the form
function resetForm() {
  form.reset();
  inputs.forEach(input => {
    input.classList.remove('is-invalid');
  });
  document.getElementById("result").innerHTML = ""
}
function get_prediction() {
  var NUM_CLT = document.getElementById("NUM_CLT").value;
  var CA = document.getElementById("CA").value;
  var RN = document.getElementById("RN").value;
  var CFN = document.getElementById("CFN").value;
  var FPN = document.getElementById("FPN").value;
  var DS = document.getElementById("DS").value;
  var LIQ = document.getElementById("LIQ").value;
  var BFR = document.getElementById("BFR").value;
  var FR = document.getElementById("FR").value;
  var CAP_PROP = document.getElementById("CAP_PROP").value;
  var TOT_BL = document.getElementById("TOT_BL").value;
  var PAS = document.getElementById("PAS").value;
  var ACT = document.getElementById("ACT").value;

  // Make an AJAX request to Flask to calculate the sum
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/predict');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    if (xhr.status === 200) {
      res=JSON.parse(xhr.response)
      console.log(typeof(res))
      console.log(res)
      console.log(res['result'])
      console.log(typeof(res[result]))
      document.getElementById('result').innerHTML = '<div class="alert alert-warning" role="alert"> Probabilité de defaut bancaire est : '+res['result']+'%</div>'
      
    } else {
      console.log('Request failed. Returned status of ' + xhr.status);
    }
  };
  xhr.send(JSON.stringify({ 'NUM_CLT': NUM_CLT, 'CA': CA, 'RN': RN, 'CFN': CFN, 'FPN': FPN, 'DS': DS, 'LIQ': LIQ, 'BFR': BFR, 'FR': FR, 'CAP_PROP': CAP_PROP, 'TOT_BL': TOT_BL, 'PAS': PAS, 'ACT': ACT }));
}
const img = document.getElementById('logo');
img.addEventListener('click', function() {
  window.location.href = '/home';
});
(function() {
  /* keys removed for saftey */
  var config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: ""
  };
  firebase.initializeApp(config);
  /* DOM elements */
  const txtEmail = document.getElementById('txtUser');
  const txtPass = document.getElementById('txtPass');
  const btnLogin = document.getElementById('sign_in');
  const btnCreate = document.getElementById('create_account');
  const logoutBtn = document.getElementById('logout_btn');
  /* sign in method with email and pass */
  btnLogin.addEventListener('click', e => {
    const email = txtEmail.value;
    const pass = txtPass.value;
    const auth = firebase.auth();

    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
  });
  /* create user and validate proper email and pass */
  btnCreate.addEventListener('click', e =>{
    const email = txtEmail.value;
    const pass = txtPass.value;
    const auth = firebase.auth();
    if (validateEmail(txtEmail.value) && pass.length >= 6) {
      var promise = auth.createUserWithEmailAndPassword(email, pass);
        //promise.catch(e => console.log(e.message));

    }
    else if (!validateEmail(txtEmail.value)) {
      document.getElementById('user_label').className += " user_label_error";
      document.getElementById('txtUser').className += " input_und_error";
      setTimeout(function() {
      document.getElementById('user_label').classList.remove('user_label_error');
      document.getElementById('txtUser').classList.remove('input_und_error');
    }, 6000);
    }
    else if (pass.length < 6) {
      document.getElementById('pass_label').className += " user_label_error";
      document.getElementById('txtPass').className += " input_und_error";
      setTimeout(function() {
      document.getElementById('pass_label').classList.remove('user_label_error');
      document.getElementById('txtPass').classList.remove('input_und_error');
    }, 6000);
    }
  });
  /* keep track of auth states */
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
      window.location.href = './main_page.html';
      console.log(firebaseUser);
    }
    else {
      console.log('not logged in');
    }
  });
}());
/* regex function to validate proper emails */
function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

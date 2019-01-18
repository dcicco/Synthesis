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
  /* firebase auth for keeping user info persistant, currently is set
  to local persistance user will be logged in until logout function is called
  loads data that is needed for the user */
}());
firebase.auth().onAuthStateChanged(function(firebaseUser) {
  if (firebaseUser) {
    userid = firebaseUser.uid;
    console.log(firebaseUser);
    var currentEmail = firebaseUser.email;
    var currentProfPic = firebaseUser.photoURL;
    $("#username_txt").text(currentEmail);
    $("#profile_pic").attr("src", currentProfPic);
    logoutBtn.onclick = logoutUser;
    userDataRef = firebase.database().ref('userdata');
    userDataRefUID = firebase.database().ref('userdata/' + firebase.auth().currentUser.uid);
    var query = userDataRefUID.orderByChild('timestamp').startAt(now);
    userDataRefUID.on('child_added', loadNewPlaylist, playlistErr);
  };
});
/* DOM elements being used */
var now = new Date().getTime();
var spotifyapi = new SpotifyWebApi();
var modal = document.getElementById('settings');
var settings = document.getElementById('user_setting');
var settingsX = document.getElementById('close_modal');
var imageInput = document.getElementById('prof_pic_input');
var logoutBtn = document.getElementById('logout_btn');
var mainFrame = document.getElementById('site_frame');
var scTab = document.getElementById('sc');
var spTab = document.getElementById('sp');
var ytTab = document.getElementById('yt');
var addPL = $('#add_list');
var playlists = $('#playlists');
var header = $('#header_text');
var pSettings = document.getElementById('playlist_setting');
var pModal = document.getElementById('playlist_modal');
var pClose = document.getElementById('close_p');
var pHeader = $('#pHeader');
var changePName = $('#pName');
var changePBtn = $('#pNameChg');
/* storage and database references */
var storageRef = firebase.storage().ref();
var imageRef = firebase.storage().ref('profile-images');
var imageDataRef = firebase.database().ref('profiles/images');
/* logs out the user when the logout button is pressed
and returns to the login page, firebaseUser is then null */

function logoutUser() {
  firebase.auth().signOut();
  window.location.href = './login.html';
};
/* jquery function to hide the default file input
and cover it with a sylized button that is triggerd */
$('#prof_pic_btn').on('click', function() {
  $('#prof_pic_input').trigger('click');
});
/* events to open and close the modal settings menu */
settings.onclick = function() {
  modal.style.display = "block";
};
settingsX.onclick = function() {
  modal.style.display = "none";
};
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  };
};
/* events to open and close the playlist modal settings menu */
pSettings.onclick = function() {
  pModal.style.display = "block";
};
pClose.onclick = function() {
  pModal.style.display = "none";
};
/* function to upload user images and set them as the profile picture
file names are not unique but are instead stored under a unique directory
that is different per user */
function uploadImage() {
  var currentImage = imageInput.files[0];
  console.log(imageInput.files[0].name);
  var imageName = firebase.auth().currentUser.uid + '/' + imageInput.files[0].name;
  console.log(imageName);
  var uploadTask = imageRef.child(imageName).put(currentImage);

  return new Promise(function(resolve, reject) {
    uploadTask.on('state_changed', function(snapshot) {
      console.log('uploaded: ' + snapshot.bytesTransferred + '/' + snapshot.totalBytes + ' bytes');
    }, function(err) {
      console.log('upload error: ', err);
      reject(err);
    }, function() {
      var metadata = uploadTask.snapshot.metadata;
      var key = metadata.md5Hash.replace(/\//g, ':');
      console.log(key);
      /* JSON record that is uploaded simultaneously to the database to create
      a record of the image along with its metadata */
      var imageRecord = {
              downloadURL: uploadTask.snapshot.downloadURL,
              key: key,
              metadata: {
                fullpath: metadata.fullPath,
                md5Hash: metadata.md5Hash,
                name: metadata.name
              }
          };
          firebase.auth().currentUser.updateProfile({
            photoURL: uploadTask.snapshot.downloadURL
          }).then(function() {
            console.log('Profile picture updated');
          }).catch(function(error) {
            console.log('An error occured while updating');
          });
          console.log(JSON.stringify(imageRecord));
          imageDataRef.child(key).set(imageRecord);
    });
  });
};
imageInput.onchange = uploadImage;

//adds a playlist and sets its metadata to be sent to the database for retrival
function addPlaylist() {
  var pUid = firebase.auth().currentUser.uid;
  var playlist = {
    owner: pUid,
    location: userDataRef.toString(),
    timestamp: firebase.database.ServerValue.TIMESTAMP
  };
  if (playlists.children().length == 0) {
    var dText = 'New Playlist';
    playlist.title = dText;
  }
  else {
    var dText = 'New Playlist ' + playlists.children().length;
    playlist.title = dText;
  };
  console.log(playlist);
  userDataRefUID.push(playlist);
};
addPL.on('click', addPlaylist);

function loadPlaylist(playlist) {
  console.log(playlist.val());
  var pNodes = _.size(playlist.val());
  var keys = Object.keys(playlist.val());
  console.log(keys.length);
  for (i=0; i<pNodes; i++) {
    var pChildren = playlists.children().length;
    var uPlaylist = playlist.child(keys[i]).val();
    console.log(uPlaylist);
    newPlaylist = document.createElement('li');
    newSpan = document.createElement('span');
    newSpan.className = 'fa fa-bars';
    newPlaylist.className = 'list_items';
    newPlaylist.append(newSpan);
    newPlaylist.setAttribute('tabindex', (playlists.children().length + 1));
    var pText = '\u00A0 ' + uPlaylist.title;
    newPlaylist.append(pText);
    playlists.append(newPlaylist);
  };
};

var loadedPlaylist = [];
//loads custom playlists from the firebase server and sets the to the webpage
function loadNewPlaylist(snapshot) {
  var pNodes = _.size(snapshot.val());
  var keys = Object.keys(snapshot.val());
  //for (i=0; i<pNodes; i++) {
    var uPlaylist = snapshot.val();
    console.log(uPlaylist);
    loadedPlaylist.push(uPlaylist);
    console.log(loadedPlaylist);
    newPlaylist = document.createElement('li');
    newSpan = document.createElement('span');
    newSpan.className = 'fa fa-bars';
    newPlaylist.className = 'list_items';
    newPlaylist.append(newSpan);
    newPlaylist.setAttribute('tabindex', (playlists.children().length + 1));
    var pText = '\u00A0 ' + uPlaylist.title;
    newPlaylist.append(pText);
    playlists.append(newPlaylist);
//  };
};

function playlistErr(err) {
  console.log(err);
};

//gets the token from the URI that is returned
function getURIParams() {
  var params = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('#') + 1).split('&');
  for (i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    params.push(hash[0]);
    params[hash[0]] = hash[1];
  }
  return params;
};

//sets scopes and client id to request OAuth token for access to the Spotify API
function sAuth() {
  /* keys removed for saftey */
  var client_id = '';
  var redirect_uri = '';
  var scope = 'playlist-modify-public streaming user-read-birthdate user-read-email user-read-private'

  var url = 'https://accounts.spotify.com/authorize';
  url += '?response_type=token';
  url += '&client_id=' + encodeURIComponent(client_id);
  url += '&scope=' + encodeURIComponent(scope);
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri);

  window.location = url;
};
console.log(getURIParams().access_token);

//loads the users playlists when it recieves authentication
spotifyapi.setAccessToken(getURIParams().access_token);
spotifyapi.getUserPlaylists('')
  .then(function(data) {
    console.log('playlists: ', data);
    console.log(data.total);
    for (i=0; i<data.total; i++) {
      newAA = document.createElement('img');
      newAA.id = i;
      newAA.className = 'album_art';
      newAA.setAttribute('tabindex', (i + 50));
      newAA.src = data.items[i].images["0"].url;
      $('#aa').append(newAA);
    }
  }, function(err){
    console.error(err);
  });
spTab.onclick = sAuth;

//grabs all needed info from the playlist/track being played and plays the selected track
function getAA(event) {
  var selectedAA = $(event.target);
  console.log(selectedAA["0"].id);
  spotifyapi.getUserPlaylists('')
      .then(function(data) {
            var userid = data.items[selectedAA["0"].id].owner.id;
            var pid = data.items[selectedAA["0"].id].id;
            spotifyapi.getPlaylistTracks(userid, pid)
              .then(function(tdata) {
                console.log(tdata);
                $('#now_playing').attr('src', tdata.items["0"].track.album.images["0"].url);
                //$('#play_bar').css({"background": "url(" + tdata.items["0"].track.album.images["0"].url + ")"});
                $('#track_artist').text(tdata.items["0"].track.artists["0"].name);
                $('#track_name').text(tdata.items["0"].track.name);
                firstTrack = tdata.items["0"].track.preview_url;
                audio = new Audio(firstTrack);
                audio.play();
        });
    });
};
var tracks = {};
var audio = document.createElement('audio');

async function testAA(event) {
  var selected = $(event.target);
  var result1 = await spotifyapi.getUserPlaylists('');
  var userid = result1.items[selected["0"].id].owner.id;
  var pid = result1.items[selected["0"].id].id;
  var result2 = await spotifyapi.getPlaylistTracks(userid, pid);
  var currentURL = result2.items["0"].track.preview_url;
  $('#now_playing').attr('src', result2.items["0"].track.album.images["0"].url);
  $('#track_artist').text(result2.items["0"].track.artists["0"].name);
  $('#track_name').text(result2.items["0"].track.name);
  tracks.currentTrack = currentURL;
};

function playAudio() {
  audio.src = tracks.currentTrack;
  audio.play();
};
function pauseAudio() {
  audio.pause();
}

//$('#aa').on('click', getAA);
$('#aa').on('click', testAA);
$('#play').on('click', playAudio);
$('#pause').on('click', pauseAudio);
//function to grab data from xml doc that is on the server and display it on a button click
function showInfo() {
  $.ajax({
    type: "GET",
    url: "creators.xml",
    dataType: "xml",
    success: function(xml) {
      $(xml).find('NAME').each(function() {
        var names = $(this).text();
        console.log(names);
        $('#creators').append('<li>' + names + '</li>');
      })
    }
  });
};
$('#info_btn').on('click', showInfo);

//changed the header on the page to the selected playlist tab
function headerText() {
  if ($('#side_pane li').is(':focus')) {
    header.text($.trim($(':focus').text()));
    $('#playlists li').click(function() {
      var listnum = $('#playlists li').index(this);
      console.log(listnum);
    });
  }
  if (playlists.children().is(':focus')) {
    var pTitle = header.text();
    console.log(pTitle);
    console.log(userDataRefUID.child(0));
    pSettings.style.display = "block";
    pHeader.text($.trim($(':focus').text()) + ' Settings');
  }
  else {
    pSettings.style.display = "none";
  }
};
$('#side_pane').on("click", headerText);

function updatePName() {
  var newName = $('#pName').val();
  if (validateWord(newName)) {
    console.log("valid");

  }
  else if (!validateWord(newName)) {
    console.log("invalid");
  }
  else {
    console.log("invalid");
  }
  console.log(newName);
  console.log(newName.length);
}
$('#pNameChg').on("click", updatePName);

function validateWord(word) {
  var rex = /^[a-zA-Z]+$/;
  return rex.test(word);
}

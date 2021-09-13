/* eslint-disable no-shadow */
/* eslint-disable eqeqeq */
import {
  db,
  getUser, sendEmail, signOut,
} from '../firebaseClient.js';
import { onNavigate } from '../main.js';

export const Home = () => {
  const user = getUser();
  const verification = user.emailVerified;
  const container = document.createElement('div');
  const html = `
  <header id=headerHome>
  <img id="logoHome" src="./sweatshirt.png">
  <h2>Trueque</h2>
  <a href ='' id='singOut' class="links">Cerrar Sesion</a>
  </header>
  <divPadre class='divPadre'>
  <h3> Te has logeado con ${user ? user.email : ''} </h3>
  <p id=verificationMessage>${verification ? '' : 'Te enviamos un link a tu correo, verifica tu cuenta'}</p>
  <form id="wallForm">
  <div id="divPost">
  <input type="text" id="post" placeholder="¿Qué quieres publicar hoy?">
  <div id="divBtn">
  <a href="" id="btnPost" class="links">Publicar</a>
  </div>
  </div>
  </form>
  <div id="errorBackground">
  <p id= errorMessage></p>
  </div>
  <div id=postContainer></div>
  </divPadre>
  `;

  container.innerHTML = html;

  if (verification === false) {
    sendEmail()
      .then(() => {
        // MANDAMOS VERIFICACION AL CORREO DEL USUARIO
      });
  }
  // CERRAR SESION
  container.querySelector('#singOut').addEventListener('click', (e) => {
    e.preventDefault();
    signOut()
      .then(() => {
        onNavigate('/');
      })
      .catch((error) => {
        console.log(error.message);
      });
  });

  const docRef = db.collection('wallPost'); // CREANDO LA COLECCIÓN EN FB
  const errorMessage = container.querySelector('#errorMessage');

  container.querySelector('#btnPost').addEventListener('click', (e) => {
    e.preventDefault();
    const publicaciones = document.querySelector('#post').value;
    const alikes = [];
    if (publicaciones === '') {
      errorMessage.innerHTML = 'Por favor ingresa una publicación';
      container.querySelector('#errorBackground').style.display = 'block';
    } else {
      container.querySelector('#errorBackground').style.display = 'none';

      docRef.add({
        publicaciones,
        alikes,
      })
        .then(() => {
          // console.log('Document successfully written!');
        })
        .catch((error) => {
          console.error('Error writing document: ', error);
        });
    }
    document.querySelector('#wallForm').reset();
  });

  const postContainer = container.querySelector('#postContainer');

  docRef
    .onSnapshot((querySnapshot) => { // TRAEMOS LOS POST Y LOS AGREGAMOS EN TIEMPO REAL
      postContainer.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const dataPost = doc.data();
        dataPost.id = doc.id;

        postContainer.innerHTML += `
      <div id='contenedorPublicacion'>
      ${dataPost.publicaciones}
      <div id="btnsContenedor">
      <a href="" id='linkEdit' class="links" data-id='${dataPost.id}'>Editar</a>      
      <img id='btnDelete' src="./eliminar.png" data-id='${dataPost.id}'>
      <div class="likes">
      <img id="like" src="./corazon.png" data-id="${dataPost.id}">
      <span id="counter">${dataPost.alikes.length}</span>
      </div>
      </div>
      </div>
      <div id="modalPadre">
      <div id="contenedorModal">
      <div id="closeDiv">
      <span class="close" id="closeX">&times;</span>
      </div>
      <input type="text" id="editInput">
      <button id="editBtnPost" data-id='${dataPost.id}'>Publicar</button>
      </div>
      </div>
      `;

        // BORRAR POST
        document.querySelectorAll('#btnDelete').forEach((btn) => { // SE RECORREN CON UN FOREACH
          btn.addEventListener('click', (e) => {
            const target = e.target; // DELEGACION DE EVENTOS
            // SE PASA COMO VALOR LA ID AL DAR CLICK SE ELIMINA
            docRef.doc(target.dataset.id)
              .delete()
              .then(() => {
                // console.log('Document successfully deleted!');
              }).catch((error) => {
                console.error('Error removing document: ', error);
              });
          });
        });

        // EDITAR POST
        document.querySelectorAll('#linkEdit').forEach((btnE) => {
          btnE.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('modalPadre').style.display = 'block';

            const target = e.target;
            docRef.doc(target.dataset.id)
              .get()
              .then((doc) => {
                const dataEdit = doc.data();
                document.getElementById('editInput').value = dataEdit.publicaciones;
              })
              .catch((error) => {
                console.log('Error getting document:', error);
              });

            document.getElementById('editBtnPost').addEventListener('click', () => {
              const target = e.target;
              const publicaciones = document.querySelector('#editInput').value;

              docRef.doc(target.dataset.id)
                .update({
                  publicaciones,
                })
                .then(() => {
                  console.log('Document successfully updated!');
                })
                .catch((error) => {
                  console.error('Error updating document: ', error);
                });
            });
            document.getElementById('closeX').addEventListener('click', () => {
              document.getElementById('modalPadre').style.display = 'none';
            });
          });
        });

        // DAR LIKE POST
        document.querySelectorAll('#like').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            console.log('like');
            const target = e.target;
            // const alikes = dataPost.alikes;
            const docLikes = docRef.doc(target.dataset.id);
            docLikes.get()
              .then((doc) => {
                if (!doc.data().alikes.includes(user.email)) {
                  console.log('alikes');
                  docLikes
                    .update({
                      alikes: firebase.firestore.FieldValue.arrayUnion(user.email),
                    });
                  console.log('likes dps');
                } else {
                  docLikes
                    .update({
                      alikes: firebase.firestore.FieldValue.arrayRemove(user.email),
                    });
                }
              });
          });
        });
      });
    });

  return container;
};

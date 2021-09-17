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
  <h3> Te has logeado ${user ? user.email : ''} </h3>
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
  const postContainer = container.querySelector('#postContainer');
  const errorMessage = container.querySelector('#errorMessage');

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
        errorMessage.innerHTML = error.message;
        container.querySelector('#errorBackground').style.display = 'block';
      });
  });

  const docRef = db.collection('wallPost'); // CREANDO LA COLECCIÓN EN FB

  container.querySelector('#btnPost').addEventListener('click', (e) => {
    e.preventDefault();
    const publicaciones = document.querySelector('#post').value;
    const likes = [];
    const nameUser = user.email;
    if (publicaciones === '') {
      errorMessage.innerHTML = 'Por favor ingresa una publicación';
      container.querySelector('#errorBackground').style.display = 'block';
    } else {
      container.querySelector('#errorBackground').style.display = 'none';
      // AGREGA POST
      docRef.add({
        publicaciones,
        likes,
        nameUser,
      })
        .then(() => {
        // 'Document successfully written!
        })
        .catch((error) => {
          errorMessage.innerHTML = error.message;
          container.querySelector('#errorBackground').style.display = 'block';
        });
    }
    document.querySelector('#wallForm').reset();
  });

  docRef
    .onSnapshot((querySnapshot) => { // TRAEMOS LOS POST Y LOS AGREGAMOS EN TIEMPO REAL
      postContainer.innerHTML = '';
      querySnapshot.forEach((doc) => {
        const dataPost = doc.data();
        dataPost.id = doc.id;

        postContainer.innerHTML += `
        <section id="nameUserSection">
        <p id="nameUser">${dataPost.nameUser} escribió:</p>
        </section>
      <div id='contenedorPublicacion'>
      ${dataPost.publicaciones}
      <div id="btnsContenedor">
      <a href="" id='linkEdit' class="links" data-id='${dataPost.id}'>Editar</a>      
      <img id='btnDelete' src="./eliminar.png" data-id='${dataPost.id}'>
      <div class="likes">
      <img id="like" src="./corazon.png" data-id="${dataPost.id}">
      <span id="counter">${dataPost.likes.length}</span>
      </div>
      </div>
      </div>

      <div id="modalEdit" class="modalPadre">
      <div class="contenedorModal">
      <div class="closeDiv">
      <div class="confirmDiv">
      <p class="confirm">¿Editar esta publicación?</p>
      </div>
      <span class="close" id="closeEdit">&times;</span>
      </div>
      <input type="text" id="editInput">
      <button id="editBtnPost" data-id='${dataPost.id}'>Publicar</button>
      </div>
      </div>

      <div id="modalDelete" class="modalPadre">
      <div class="contenedorModal">
      <div class="closeDiv">
      <div class="confirmDiv">
      <p class="confirm">¿Borrar esta publicación?</p>
      </div>
      <span class="close" id="closeDelete">&times;</span>
      </div>
      <div id="deleteDiv"></div>
      <button id="deleteBtnPost" data-id='${dataPost.id}'>Borrar</button>
      </div>
      `;

        // BORRAR POST
        document.querySelectorAll('#btnDelete').forEach((btn) => { // SE RECORREN CON UN FOREACH
          btn.addEventListener('click', (e) => {
            document.getElementById('modalDelete').style.display = 'block';
            const target = e.target; // DELEGACION DE EVENTOS
            docRef.doc(target.dataset.id)
              .get()
              .then((doc) => {
                const dataDelete = doc.data();
                document.getElementById('deleteDiv').innerHTML = dataDelete.publicaciones;
              })
              .catch((error) => {
                errorMessage.innerHTML = error.message;
                container.querySelector('#errorBackground').style.display = 'block';
              });
            document.getElementById('deleteBtnPost').addEventListener('click', (e) => {
              const target = e.target;
              docRef.doc(target.dataset.id)
                .delete()
                .then(() => {
                // Document successfully deleted!
                }).catch((error) => {
                  errorMessage.innerHTML = error.message;
                  container.querySelector('#errorBackground').style.display = 'block';
                });
            });

            document.getElementById('closeDelete').addEventListener('click', () => {
              document.getElementById('modalDelete').style.display = 'none';
            });
          });
        });

        // EDITAR POST
        document.querySelectorAll('#linkEdit').forEach((btnE) => {
          btnE.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('modalEdit').style.display = 'block';

            const target = e.target;
            docRef.doc(target.dataset.id)
              .get()
              .then((doc) => {
                const dataEdit = doc.data();
                document.getElementById('editInput').value = dataEdit.publicaciones;
              })
              .catch((error) => {
                errorMessage.innerHTML = error.message;
                container.querySelector('#errorBackground').style.display = 'block';
              });

            document.getElementById('editBtnPost').addEventListener('click', () => {
              const target = e.target;
              const publicaciones = document.querySelector('#editInput').value;

              docRef.doc(target.dataset.id)
                .update({
                  publicaciones,
                })
                .then(() => {
                  // Document successfully updated!
                })
                .catch((error) => {
                  errorMessage.innerHTML = error.message;
                  container.querySelector('#errorBackground').style.display = 'block';
                });
            });
            document.getElementById('closeEdit').addEventListener('click', () => {
              document.getElementById('modalEdit').style.display = 'none';
            });
          });
        });

        // DAR LIKE POST
        document.querySelectorAll('#like').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const target = e.target;
            const docLikes = docRef.doc(target.dataset.id);
            docLikes.get()
              .then((doc) => {
                if (!doc.data().likes.includes(user.email)) {
                  docLikes
                    .update({
                      likes: firebase.firestore.FieldValue.arrayUnion(user.email),
                    });
                } else {
                  docLikes
                    .update({
                      likes: firebase.firestore.FieldValue.arrayRemove(user.email),
                    });
                }
              });
          });
        });
      });
    });

  return container;
};

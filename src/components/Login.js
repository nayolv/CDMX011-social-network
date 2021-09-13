import { signIn, googleRegister } from '../firebaseClient.js';
import { onNavigate } from '../main.js';

export const Login = () => {
  const container = document.createElement('div');

  const html = ` 
  <header>
  </header>
  <div class="divPadre">
  <section id="contenedorLogo">
  <img id="logo" src="./sweatshirt.png">
  <h1>Trueque</h1>
  <p id="slogan">La comunidad más grande de intercambio de ropa.</p>
  </section>
  <div id="errorBackground">
  <p id= errorMessage></p>
  </div>

  <main>
  <form class="formulario">
  <section id="sectionInputs">
  <input type="email" id="email" class="inputs" placeholder="example@email.com">
  <input type="password" id="password" class="inputs" placeholder="Contraseña">
  </section>
  <button id="btnLogin">Iniciar sesión</button>
  <button id="btnGoogle">Continua con Google</button>
  <a id="textRegister">¿No tienes una cuenta?</a>
  <a href="" id="registerLink" class="links">Registrate</a>
  </form>
  </main>
  </div>`;

  container.innerHTML = html;
  const errorMessage = container.querySelector('#errorMessage');

  container.querySelector('#registerLink').addEventListener('click', (e) => {
    e.preventDefault();
    onNavigate('/register');
  });

  container.querySelector('#btnLogin').addEventListener('click', (e) => {
    e.preventDefault();
    const email = container.querySelector('input[type=email]').value;
    const password = container.querySelector('input[type=password]').value;
    signIn(email, password)
      .then(() => onNavigate('/wall'))
      .catch((error) => {
        errorMessage.innerHTML = error.message;
        container.querySelector('#errorBackground').style.display = 'block';
      });
  });

  container.querySelector('#btnGoogle').addEventListener('click', (e) => {
    e.preventDefault();
    googleRegister()
      .then(() => onNavigate('/wall'))
      .catch((error) => {
        errorMessage.innerHTML = error.message;
        container.querySelector('#errorBackground').style.display = 'block';
      });
  });

  return container;
};

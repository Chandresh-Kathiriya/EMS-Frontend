// src/Pages/NotFound404.js
import Layout from '../Components/Layout';

function NotFound404() {
  return (
    <>
      <Layout>
        <section className="section error-404 min-vh-100 d-flex flex-column align-items-center justify-content-center">
          <h1>404</h1>
          <h2>The page you are looking for doesn't exist.</h2>
          <a className="btn" href="/">Back to home</a>
        </section>
      </Layout>
    </>
  )
}

export default NotFound404;
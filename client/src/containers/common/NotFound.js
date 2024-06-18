import React from "react";

const NotFound = () => (
  <div className="not-found">
    <h1>404</h1>
    <p>I think you're lost.</p>
    <p>Click on the cat to go back home.</p>
    <br />
    <a href="/">
      <img
        src="https://http.cat/404"
        alt="404"
        style={{ width: "400px", maxWidth: "100%" }}
      />
    </a>
  </div>
);

export default NotFound;

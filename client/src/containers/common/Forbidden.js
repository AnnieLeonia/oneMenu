import React from "react";

const Forbidden = () => (
  <div className="not-found">
    <h1>403</h1>
    <p>I'm sorry, I can't let you in.</p>
    <p>Click on the cat to go back home.</p>
    <br />
    <a href="/">
      <img
        src="https://http.cat/403"
        alt="403"
        style={{ width: "400px", maxWidth: "100%" }}
      />
    </a>
  </div>
);

export default Forbidden;

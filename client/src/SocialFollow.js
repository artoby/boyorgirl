// Idea and basic implementation taken from James Q Quick https://codesandbox.io/s/401k56m3kw. Thanks!

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTwitter,
  faTelegram,
  faGithub,

} from "@fortawesome/free-brands-svg-icons";
import './Social.css';



export default function SocialFollow() {
  return (
    <div className="social-container">
      <h6>Follow</h6>

      <a href="https://www.twitter.com/r2bAI" className="twitter social">
        <FontAwesomeIcon icon={faTwitter}  size="2x" />
      </a>

      <a
        href="https://www.t.me/r2bAI"
        className="telegram social"
      >
        <FontAwesomeIcon icon={faTelegram} size="2x" />
      </a>
      <a
        href="https://github.com/artoby/boyorgirl"
        className="github social"
      >
        <FontAwesomeIcon icon={faGithub} size="2x" />(code)
      </a>
    </div>
  );
}

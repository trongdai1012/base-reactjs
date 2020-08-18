import React from "react";
import {CircularProgress} from "@material-ui/core";
import {toAbsoluteUrl} from "../../_helpers";

export function SplashScreen() {
  return (
    <>
      <div className="splash-screen">
        <img
          src={toAbsoluteUrl("/media/logos/favicon-kick-english-100x100.png")}
          alt="KickEnglish logo"
        />
        <CircularProgress className="splash-screen-spinner" />
      </div>
    </>
  );
}

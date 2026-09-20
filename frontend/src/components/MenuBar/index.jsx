//imports react
import React from "react";
import { Link } from "react-router-dom";

import logo_pet from "../../assets/icone_pet.svg"

//imports css
import "./menu.css";

const MenuBar = () => {
  return (
    <header className="menu">

      <div className="menu-title">
        <div className="pet-logo">
          <img src={logo_pet} alt="" />
        </div>
        <h1 className="menu-h1">
          Estatísticas das disciplinas de Engenharia de Computação
        </h1>
      </div>

      <nav className="menu-links" aria-label="Seções do site">
        <Link className="menutext" to="/">
          Períodos{" "}
        </Link>
        <Link className="menutext" to="/departamentos">
          Departamentos{" "}
        </Link>
        <Link className="menutext" to="/nome">
          Nome{" "}
        </Link>
        <Link className="menutext" to="/reprovacoes">
          Reprovações
        </Link>
      </nav>

    </header>
  );
};

export default MenuBar;

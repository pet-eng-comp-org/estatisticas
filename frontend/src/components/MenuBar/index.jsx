//imports react
import React from "react";
import { Link } from "react-router-dom";

import logo_pet from "../../assets/icone_pet.svg"

//imports css
import "./menu.css";

const MenuBar = () => {
  return (
    <div className="menu">

      <div className="menu-title">
        <div className="pet-logo">
          <img src={logo_pet} alt="logo PET"/>
        </div>
        <span>Estatísticas das disciplinas de Engenharia da Computação</span>
      </div>

      <div className="menu-links">
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
      </div>

    </div>
  );
};

export default MenuBar;

import Link from "next/link"

const MenuPrincipal = () => {
  return (
    <div className="list-group">
      <Link href="/usuarios" className="list-group-item list-group-item-action">
        Usuarios
      </Link>
      <Link href="/financiadores" className="list-group-item list-group-item-action">
        Financiadores
      </Link>
      <Link href="/copartes" className="list-group-item list-group-item-action">
        Copartes
      </Link>
      <Link href="/proyectos" className="list-group-item list-group-item-action">
        Proyectos
      </Link>
    </div>
    // <div className="accordion accordion-flush">
    //   <div className="accordion-item">
    //     <h2 className="accordion-header">
    //       <button
    //         className="accordion-button collapsed"
    //         type="button"
    //         data-bs-toggle="collapse"
    //         data-bs-target="#flush-collapseOne"
    //         aria-expanded="false"
    //         aria-controls="flush-collapseOne"
    //       >
    //         Usuarios
    //       </button>
    //     </h2>
    //     <div
    //       id="flush-collapseOne"
    //       className="accordion-collapse collapse"
    //       data-bs-parent="#accordionFlush"
    //     >
    //       <div className="accordion-body">
    //         <nav>
    //           <ul>
    //             <li>
    //               <Link href="/usuarios" className="">
    //                 Listado
    //               </Link>
    //             </li>
    //             <li>
    //               <Link href="/usuarios/registro" className="">
    //                 Registrar
    //               </Link>
    //             </li>
    //           </ul>
    //         </nav>
    //       </div>
    //     </div>
    //   </div>
    //   <div className="accordion-item">
    //     <h2 className="accordion-header">
    //       <button
    //         className="accordion-button collapsed"
    //         type="button"
    //         data-bs-toggle="collapse"
    //         data-bs-target="#flush-collapseTwo"
    //         aria-expanded="false"
    //         aria-controls="flush-collapseTwo"
    //       >
    //         Financiadores
    //       </button>
    //     </h2>
    //     <div
    //       id="flush-collapseTwo"
    //       className="accordion-collapse collapse"
    //       data-bs-parent="#accordionFlush"
    //     >
    //       <div className="accordion-body"></div>
    //     </div>
    //   </div>
    //   <div className="accordion-item">
    //     <h2 className="accordion-header">
    //       <button
    //         className="accordion-button collapsed"
    //         type="button"
    //         data-bs-toggle="collapse"
    //         data-bs-target="#flush-collapseThree"
    //         aria-expanded="false"
    //         aria-controls="flush-collapseThree"
    //       >
    //         Copartes
    //       </button>
    //     </h2>
    //     <div
    //       id="flush-collapseThree"
    //       className="accordion-collapse collapse"
    //       data-bs-parent="#accordionFlush"
    //     >
    //       <div className="accordion-body">3</div>
    //     </div>
    //   </div>
    // </div>
  )
}

export { MenuPrincipal }

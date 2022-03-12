import React, {useState} from "react";
import {BrowserRouter, Outlet, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import * as ReactDOM from "react-dom";
import ListAllQuotes from "./components/List";
import {Button, ButtonGroup, Nav, Navbar} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faShuffle} from "@fortawesome/free-solid-svg-icons";
import CreateModal from "./components/CreateModal";
import SingleQuote from "./components/SingleQuote";
import NoMatch from "./components/404";
import {redirectToRandomQuote} from "./functions";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<ListAllQuotes/>} />
                <Route path="/quote/:uuid" element={<SingleQuote />} key={window.location.pathname} />

                <Route path="*" element={<NoMatch />} />
            </Route>
        </Routes>
    );
}

function Layout() {
    const [ showCreateModal, setShowCreateModal ] = useState(false);
    const handleShow = () => setShowCreateModal(true);
    const handleClose = () => setShowCreateModal(false);
    const navigate = useNavigate();

    return (
        <>
            <Navbar className="justify-content-center">
                <Navbar.Brand href="/" className="text-white p-0">
                    <img src="/images/logo-white.png" alt={"Winnipeg FIR Logo"} className={"logo pe-2"} />
                    <span className={"text-logo"}>Winnipeg FIR </span>
                    <span>Quote Wall</span>
                </Navbar.Brand>
                {
                    useLocation().pathname === "/" && (
                        <Nav>
                            <ButtonGroup>
                                <Button variant="secondary" size="sm" style={{ backgroundColor: "#21262d" }} onClick={handleShow}>
                                    <FontAwesomeIcon icon={faPlus} />&nbsp;
                                    New Quote
                                </Button>
                                <Button variant="secondary" size="sm" style={{ backgroundColor: "#21262d" }} onClick={() => redirectToRandomQuote(navigate)}>
                                    <FontAwesomeIcon icon={faShuffle} />&nbsp;
                                    Random
                                </Button>
                            </ButtonGroup>
                        </Nav>
                    )
                }
            </Navbar>

            <h5 className="text-center px-2 mb-0">
                All the greatest moments caught in the Winnipeg FIR... if you're on here somewhere, we're sorry.
            </h5>

            <hr style={{ backgroundColor: "#89929b"}} />

            <Outlet />

            <CreateModal show={showCreateModal} onClose={handleClose} />
        </>
    );
}

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>, document.getElementById('app'));

import React, {useEffect, useState} from "react";
import {BrowserRouter, Outlet, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import * as ReactDOM from "react-dom";
import ListAllQuotes from "./components/List";
import {Button, ButtonGroup, Nav, Navbar, NavLink} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faShuffle} from "@fortawesome/free-solid-svg-icons";
import CreateModal from "./components/CreateModal";
import SingleQuote from "./components/SingleQuote";
import NoMatch from "./components/404";
import {redirectToRandomQuote} from "./functions";
import AdminIndex from "./components/admin/Index";
import HandleCallback from "./components/admin/Auth/HandleCallback";
import AdminQuoteList from "./components/admin/QuoteList";
import AdminUserList from "./components/admin/UserList";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<ListAllQuotes/>} />
                <Route path="/quote/:uuid" element={<SingleQuote />} key={window.location.pathname} />

                <Route path="*" element={<NoMatch />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminIndex />} />
                <Route path="auth/callback" element={<HandleCallback />} />
                <Route path="quotes" element={<AdminQuoteList />} />
                <Route path="users" element={<AdminUserList />} />
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

function AdminLayout() {
    const [ isAuthenticated, setAuthenticated ] = useState(false);
    const [ user, setUser ] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/admin/authenticated')
            .then((res) => {
                setAuthenticated(res.data.auth);
            }).catch((err) => console.log(err));

    }, []);

    useEffect(() => {
        if (!isAuthenticated)
            return;

        axios.get('/api/admin/user')
            .then((res) => {
                setUser(res.data.data);
            }).catch((err) => console.log(err));

    }, [isAuthenticated]);

    return (
        <>
            <Navbar className="justify-content-center">
                <Navbar.Brand href="/admin" className="text-white p-0">
                    <img src="/images/logo-white.png" alt={"Winnipeg FIR Logo"} className={"logo pe-2"}/>
                    <span className={"text-logo"}>Winnipeg FIR </span>
                    <span>Quote Management</span>
                </Navbar.Brand>
                <Nav>
                    { !isAuthenticated && (
                        <NavLink className="text-white"  href="/auth/login/redirect">Login</NavLink>
                    )}

                    {
                        isAuthenticated && (
                            (user.is_admin || user.is_super_admin) && (
                                <>
                                    <NavLink className="text-white" onClick={() => {navigate("/admin/quotes")}}>Quotes</NavLink>
                                </>
                            )
                        )
                    }

                    {
                        isAuthenticated && (
                            user.is_super_admin && (
                                <>
                                    <NavLink className="text-white" onClick={() => {navigate("/admin/users")}}>Users</NavLink>
                                </>
                            )
                        )
                    }

                    {
                        isAuthenticated && (
                            <NavLink className="text-white" href="/auth/logout">Logout</NavLink>
                        )
                    }

                </Nav>
            </Navbar>

            <h5 className="text-center px-2 mb-0">
                <i>“You will die but the words you speak or spoke, will live forever.”</i> — Auliq Ice
            </h5>

            <hr style={{backgroundColor: "#89929b"}}/>

            <Outlet context={[isAuthenticated, user]} />
        </>
    );
}

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>, document.getElementById('app'));

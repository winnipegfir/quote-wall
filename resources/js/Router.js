import React, {useEffect, useState} from "react";
import {BrowserRouter, Outlet, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import * as ReactDOM from "react-dom";
import ListAllQuotes from "./components/List";
import {Button, ButtonGroup, Form, Modal, Nav, Navbar, NavLink} from "react-bootstrap";
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
import AdminBans from "./components/admin/Bans";

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
                <Route path="bans" element={<AdminBans />} />
                <Route path="users" element={<AdminUserList />} />
            </Route>
        </Routes>
    );
}

function Layout() {
    const [ showCreateModal, setShowCreateModal ] = useState(false);
    const handleShow = () => setShowCreateModal(true);
    const handleClose = () => setShowCreateModal(false);

    const [ showPrivacyModal, setShowPrivacyModal ] = useState(false);
    const handleShowPrivacy = () => setShowPrivacyModal(true);
    const handleClosePrivacy = () => setShowPrivacyModal(false);

    const navigate = useNavigate();

    return (
        <>
            <Navbar className="justify-content-center">
                <Navbar.Brand href="/" className="text-white p-0">
                    <img src="/images/logo-white.png" alt={"Winnipeg FIR Logo"} className={"logo pe-2"} />
                    <span className={"text-logo"}>Winnipeg FIR </span>
                    <span>Quote Wall</span>
                </Navbar.Brand>
                <Nav>
                    <ButtonGroup>
                        {
                            useLocation().pathname === "/" && (
                                <>
                                    <Button variant="secondary" size="sm" style={{backgroundColor: "#21262d"}}
                                            onClick={handleShow}>
                                        <FontAwesomeIcon icon={faPlus}/>&nbsp;
                                        New Quote
                                    </Button>
                                    <Button variant="secondary" size="sm" style={{backgroundColor: "#21262d"}}
                                            onClick={() => redirectToRandomQuote(navigate)}>
                                        <FontAwesomeIcon icon={faShuffle} />&nbsp;
                                        Random
                                    </Button>
                                </>
                            )
                        }
                        <Button variant="secondary" size="sm" style={{ backgroundColor: "#21262d" }} onClick={handleShowPrivacy}>
                            Privacy
                        </Button>
                    </ButtonGroup>
                </Nav>
            </Navbar>

            <h5 className="text-center px-2 mb-0">
                All the greatest moments caught in the Winnipeg FIR... if you're on here somewhere, we're sorry.
            </h5>

            <hr style={{ backgroundColor: "#89929b"}} />

            <Outlet />

            <CreateModal show={showCreateModal} onClose={handleClose} />
            <PrivacyModal show={showPrivacyModal} onClose={handleClosePrivacy} />
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
                                    <NavLink className="text-white" onClick={() => {navigate("/admin/bans")}}>IP Bans</NavLink>
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
            <div className="text-center">
                { user.name ? "Authenticated as " + user.name : "" }
            </div>

            <h5 className="text-center px-2 mb-0">
                <i>“You will die but the words you speak or spoke, will live forever.”</i> — Auliq Ice
            </h5>

            <hr style={{backgroundColor: "#89929b"}}/>

            <Outlet context={[isAuthenticated, user]} />
        </>
    );
}

function PrivacyModal(props) {
    const { show, onClose } = props;

    return (
        <Modal size="lg" show={show} onHide={onClose}>
            <Modal.Header className="justify-content-center">
                <Modal.Title>Privacy and Data Handling</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-4">
                    <h5 className="fw-bold">First things first</h5>
                    This website is meant for the enjoyment of our members. If you see a quote relating to you on here that
                    you do not want on here, <b>PLEASE</b> reach out to me via <a href="mailto:k.dunning@vatcan.ca">email</a>.
                    <br /><br />
                    For privacy, <a href="https://en.wikipedia.org/wiki/Web_indexing">search-engine indexing</a> has been
                    disabled (as much as possible) on this website. We are not trying to harm people.
                    <br /><br />
                    <b>We also moderate incoming quotes.</b> This is to prevent this website from being used for bullying or
                    harassing other members (VATSIM or not).
                </div>
                <div className="mb-4">
                    <h5 className="fw-bold">IP Address Logging</h5>
                    If you submit a quote (hitting the submit button in the <code>Create Quote</code> modal), your IP
                    address <b>will</b> be stored. This is strictly for banning people who are improperly using the website.
                    This is only viewable by website moderators, and is not shared with third parties.
                    <br /><br/>
                    By using the main website (on paths '/' or '/random'), no information is stored except under the conditions above.
                </div>
                <div className="mb-4">
                    <h5 className="fw-bold">I want to remove my data</h5>
                    If you would like to remove a quote you created, reach out to me via <a href="mailto:k.dunning@vatcan.ca">email</a>.
                    <br /><br />
                    IP addresses may still be saved even after your quote is deleted (reasons mentioned above).
                </div>
                <div className="mb-4">
                    <h5 className="fw-bold">Questions?</h5>
                    As with everything above, please reach out to me via <a href="mailto:k.dunning@vatcan.ca">email</a>.
                    <br /><br/>
                    I can clarify any questions you have relating to privacy or the website in general.
                </div>
                <h4 className="text-center fw-bold">Thanks for coming to the quote wall!</h4>
            </Modal.Body>
        </Modal>
    );
}

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>, document.getElementById('app'));

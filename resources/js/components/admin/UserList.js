import NoMatch from "../404";
import {Helmet, HelmetData} from "react-helmet-async";
import {Button, ButtonGroup, Col, Form, Modal, Row, Table} from "react-bootstrap";
import {useEffect, useState} from "react";
import {useOutletContext} from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCheckCircle, faPlus, faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import '@sweetalert2/theme-dark/dark.scss';
import axios from "axios";

export default function () {
    const [_, user] = useOutletContext();
    const helmetData = new HelmetData({});

    const [ users, setUsers ] = useState({});

    const [showModal, setShowModal] = useState(false);
    const handleShowModal = () => setShowModal(true);
    const handleHideModal = () => setShowModal(false);

    const [CID, setCID] = useState(null);
    const [name, setName] = useState(null);

    const updateTable = () => {
        axios.get('/api/admin/users')
            .then((res) => {
                setUsers(res.data.data);
            }).catch((err) => {
                console.log(err)
            });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        e.target.disabled = true;

        const formData = new FormData();
        if (CID !== null && CID !== undefined)
            formData.append('cid', CID);

        if (name !== null && name !== undefined)
            formData.append('name', name);

        // Clean variables
        setCID(null);
        setName(null);

        await axios.post('/api/admin/users', formData)
            .then((res) => {
                handleHideModal();

                Swal.fire({
                    icon: "success",
                    text: "User created."
                });

                updateTable();
            }).catch((error) => {
                handleHideModal();

                switch (error.response.status) {
                    case 422:
                        Swal.fire({
                            icon: "error",
                            html: "Validation error. Check your input and try again.<br><br><code>" + error.response.data.message + "</code>"
                        });
                        break;
                    case 429:
                        Swal.fire({
                            icon: "error",
                            text: "Too many requests. You are being rate limited."
                        });
                        break;
                    default:
                        Swal.fire({
                            icon: "error",
                            text: "An error occurred."
                        });
                }

                console.log(error.response)
            })

        e.target.disabled = false;
    }

    async function toggleAdmin(e, cid) {
        e.target.disabled = true;

        await axios.get(`/api/admin/users/${cid}/toggle`)
            .then((res) => {
                Swal.fire({
                    icon: "success",
                    text: "User's admin set to " + (res.data.data.is_admin ? "true" : "false") + "."
                });

                updateTable();
            }).catch((error) => {
                switch (error.response.status) {
                    case 422:
                        Swal.fire({
                            icon: "error",
                            html: "Validation error. Check your input and try again.<br><br><code>" + error.response.data.message + "</code>"
                        });
                        break;
                    case 429:
                        Swal.fire({
                            icon: "error",
                            text: "Too many requests. You are being rate limited."
                        });
                        break;
                    default:
                        Swal.fire({
                            icon: "error",
                            text: "An error occurred."
                        });
                }

                console.log(error.response)
            })

        e.target.disabled = false;
    }

    function changeNameForm(cid, name) {
        Swal.fire({
            title: `Update name for ${cid}`,
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            inputValue: name,
            showCancelButton: true,
            confirmButtonText: 'Submit',
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(`/api/admin/users/${cid}/name`, {"name": result.value})
                    .then((res) => {
                        Swal.fire({
                            icon: "success",
                            text: "User's name set to " + res.data.data.name + "."
                        });

                        updateTable();
                    }).catch((error) => {
                        switch (error.response.status) {
                            case 422:
                                Swal.fire({
                                    icon: "error",
                                    html: "Validation error. Check your input and try again.<br><br><code>" + error.response.data.message + "</code>"
                                });
                                break;
                            case 429:
                                Swal.fire({
                                    icon: "error",
                                    text: "Too many requests. You are being rate limited."
                                });
                                break;
                            default:
                                Swal.fire({
                                    icon: "error",
                                    text: "An error occurred."
                                });
                        }

                        console.log(error.response)
                    })
            } else {
                // Do nothing
            }
        })
    }

    useEffect(() => {
        updateTable()
    }, []);

    return (
        <>
            {user.is_super_admin ? (
                <>
                    <Helmet helmetData={helmetData}>
                        <title>Winnipeg FIR Quotes</title>
                        <meta property="description" content="All the greatest moments caught in the Winnipeg FIR... if you're on here somewhere, we're sorry." />
                    </Helmet>

                    <Row className="justify-content-center">
                        <Col md={10} className="d-flex flex-column">
                            <Button variant="outline-secondary" className="mb-2" onClick={handleShowModal}>
                                <FontAwesomeIcon icon={faPlus} /> New User
                            </Button>

                            <Table className="text-white">
                                <thead>
                                <tr>
                                    <td>CID</td>
                                    <td>Name</td>
                                    <td className="text-center">Admin</td>
                                    <td className="text-center">Super Admin</td>
                                    <td className="text-center" width="20%">Actions</td>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    users.length > 0 && users.map((user) => (
                                        <tr key={user.cid}>
                                            <td>{user.cid}</td>
                                            <td>{user.name}</td>
                                            <td className="text-center">
                                                {user.is_admin ?
                                                    <FontAwesomeIcon style={{ color: "green" }} size="2x" icon={faCheckCircle} /> :
                                                    <FontAwesomeIcon style={{ color: "red" }} size="2x" icon={faTimesCircle} />}
                                            </td>
                                            <td className="text-center">
                                                {user.is_super_admin ?
                                                    <FontAwesomeIcon style={{ color: "green" }} size="2x" icon={faCheckCircle} /> :
                                                    <FontAwesomeIcon style={{ color: "red" }} size="2x" icon={faTimesCircle} />}
                                            </td>
                                            <td className="text-center">
                                                <ButtonGroup>
                                                    <Button onClick={() => changeNameForm(user.cid, user.name)}>Change Name</Button>
                                                    <Button onClick={e => toggleAdmin(e, user.cid)}>Toggle Admin</Button>
                                                </ButtonGroup>
                                            </td>
                                        </tr>
                                    ))
                                }
                                </tbody>
                            </Table>
                        </Col>
                    </Row>

                    <Modal size="lg" show={showModal} onHide={handleHideModal}>
                        <Modal.Header className="justify-content-center">
                            <Modal.Title>New User</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleFormSubmit}>
                                <Form.Group controlId="formCid">
                                    <Form.Control min={800000}
                                                  max={1999999}
                                                  type="number"
                                                  required={true}
                                                  placeholder={"CID"}
                                                  onChange={event => setCID(event.target.value)} />
                                </Form.Group>
                                <br/>
                                <Form.Group controlId="formName">
                                    <Form.Control placeholder={"Name"} required={true} onChange={event => setName(event.target.value)} />
                                </Form.Group>
                                <Button size="sm" type="submit" variant="success" className="mt-4 w-100">Submit</Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </>
            ) : (
                <NoMatch />
            )}
        </>
    );
}

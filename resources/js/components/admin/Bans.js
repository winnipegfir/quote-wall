import {useEffect, useState} from "react";
import NoMatch from "../404";
import {useOutletContext} from "react-router-dom";
import {Helmet, HelmetData} from "react-helmet-async";
import {Button, Col, Row, Table} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faTrashCan} from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import '@sweetalert2/theme-dark/dark.scss';

export default function () {
    const [_, user] = useOutletContext();
    const helmetData = new HelmetData({});

    const [ bans, setBans ] = useState([]);

    function reload() {
        axios.get('/api/admin/bans')
            .then((res) => {
                setBans(res.data.data);
                console.log(res.data.data);
            }).catch((err) => {
                console.log(err)
            });
    }

    function handleDelete(e, id) {
        e.target.disabled = true;

        axios.delete(`/api/admin/bans/${id}`)
            .then(() => {
                Swal.fire({
                    icon: "success",
                    text: "Ban removed."
                });

                reload();
            }).catch((error) => {
                switch (error.response.status) {
                    case 404:
                        Swal.fire({
                            icon: "error",
                            html: "Ban not found."
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

    useEffect(() => {
        reload();
    }, []);

    return (
        ( user.is_super_admin ? (
            <>
                <Helmet helmetData={helmetData}>
                    <title>Winnipeg FIR Quotes</title>
                    <meta property="description" content="All the greatest moments caught in the Winnipeg FIR... if you're on here somewhere, we're sorry." />
                </Helmet>

                <Row className="justify-content-center">
                    <Col md={10} className="d-flex flex-column">
                        <Table className="text-white">
                            <thead>
                            <tr>
                                <td>ID</td>
                                <td className="text-center">IP Address</td>
                                <td className="text-center">Comment</td>
                                <td className="text-center" width="20%">Actions</td>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                bans.length > 0 && bans.map((ban) => (
                                    <tr key={ban.id}>
                                        <td>{ban.id}</td>
                                        <td className="text-center">{ban.ip_address}</td>
                                        <td className="text-center">{ban.comment}</td>
                                        <td className="text-center">
                                            <Button variant="danger" size="sm" onClick={(e) => handleDelete(e, ban.id)}>
                                                <FontAwesomeIcon icon={faTrashCan} /> Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </>
            ) : (
                <NoMatch />
            )
        )
    );
}

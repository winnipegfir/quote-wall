import {Card, Button, Modal, Form, Table, Col, Row} from "react-bootstrap";
import {useState} from "react";
import DOMPurify from "dompurify";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import '@sweetalert2/theme-dark/dark.scss';
import axios from "axios";

export default function (props) {
    const { quote, reload } = props;

    const [showModal, setShowModal] = useState(false);
    const handleShowModal = () => setShowModal(true);
    const handleHideModal = () => setShowModal(false);

    const [showMore, setShowMore] = useState(false);

    const [expandTable, setExpandTable] = useState(false);

    const [ content, setContent ] = useState(quote.content);
    const [ name, setName ] = useState(quote.name);
    const [ status, setStatus ] = useState(quote.status);

    async function handleSubmit(e) {
        e.preventDefault();

        e.target.disabled = true;

        const formData = new FormData();
        if (quote !== null && quote !== undefined)
            formData.append('content', content);

        if (name !== null && name !== undefined && name !== "") {
            formData.append('name', name);
            console.log(name);
        }

        formData.append('status', status);

        await axios.post(`/api/admin/quotes/${quote.uuid}`, formData)
            .then((res) => {
                handleHideModal();

                Swal.fire({
                    icon: "success",
                    text: "Quote has been edited successfully."
                });
            }).catch((error) => {
                handleHideModal();

                switch (error.response.status) {
                    case 404:
                        Swal.fire({
                            icon: "error",
                            html: "Quote not found."
                        });
                        break;
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

        reload();

        e.target.disabled = false;
    }

    async function banIp() {
        handleHideModal();

        Swal.fire({
            title: `Reason for IP ban`,
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Submit',
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(`/api/admin/bans`, { 'ip_address': quote.ip_address, 'comment': result.value })
                    .then(() => {
                        Swal.fire({
                            icon: "success",
                            text: "IP banned successfully."
                        });
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
                    });
            } else {
                // Do nothing
            }
        })
    }

    return (
        <>
            <Card id={quote.uuid}>
                <Card.Body className="d-flex flex-column" style={{ backgroundColor: getBackgroundColor(quote.status) }}>
                    <Button variant="secondary" size="sm" className="mb-2 small" onClick={handleShowModal}>Actions</Button>
                    <i className="mb-1"
                       dangerouslySetInnerHTML={{__html: niceQuote((showMore ? quote.content : shortQuote(quote.content)))}}/>
                    {
                        quote.content.length > 250 && (
                            <small style={{cursor: "pointer", color: "rgba(255, 255, 255, 0.9)"}}
                                   onClick={() => setShowMore(!showMore)}>
                                {showMore ? "Show Less" : "Show More"}
                            </small>
                        )
                    }
                    <div className="mt-auto d-flex flex-row text-white-50">
                        <small className="overflow-auto">
                            {quote.name ?? "Anonymous"}
                        </small>
                        <small className="ms-auto">
                            {niceDateTime(quote.created_at)}
                        </small>
                    </div>
                </Card.Body>
            </Card>

            <Modal size="lg" show={showModal} onHide={handleHideModal}>
                <Modal.Header className="justify-content-center">
                    <Modal.Title>Editing {quote.uuid}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formQuote">
                            <Form.Control as="textarea"
                                          aria-required={true}
                                          aria-valuemax={5000}
                                          value={content}
                                          onChange={event => { setContent(event.target.value) }}
                            />
                            <Form.Text>Quote | Accepts <code>&lt;b&gt;</code> tags.</Form.Text>
                        </Form.Group>
                        <br/>
                        <Form.Group controlId="formName">
                            <Form.Control aria-valuemax={50}
                                          value={name ?? ""}
                                          onChange={event => { setName(event.target.value) }}
                                          placeholder={"Anonymous if null (optional)"}/>
                            <Form.Text>Name</Form.Text>
                        </Form.Group>
                        <br/>
                        <Form.Group controlId="formStatus">
                            <Form.Select aria-valuemin={2}
                                         aria-valuemax={3}
                                         required={true}
                                         value={status}
                                         onChange={event => { setStatus(event.target.value) }}
                            >
                                <option disabled={true} hidden={true} value={1}>Pending Review</option>
                                <option value={2}>Approved</option>
                                <option value={3}>Rejected</option>
                            </Form.Select>
                            <Form.Text>Status</Form.Text>
                        </Form.Group>
                        <br/>
                        <Row>
                            <Col md={6}>
                                <Form.Group controlId="formIP">
                                    <Form.Control value={quote.ip_address} disabled={true} />
                                    <Form.Text>IP Address</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Button className="w-100" onClick={banIp}>Ban IP</Button>
                            </Col>
                        </Row>

                        <br/>
                        <Form.Group controlId="formSubmitted">
                            <Form.Control value={niceDateTime(quote.created_at)} disabled={true} />
                            <Form.Text>Created</Form.Text>
                        </Form.Group>
                        <br/>
                        <Form.Group controlId="formAudit">
                            <h6 className="text-center fw-bold">Audit Log</h6>
                            <Table className="text-white">
                                <thead>
                                <tr>
                                    <th width="20%" className="small">User</th>
                                    <th width="55%" className="small">Log</th>
                                    <th width="25%" className="text-center small">Timestamp</th>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    expandTable && quote.audit_logs.map((log) => (
                                        <tr key={log.id}>
                                            <td width="20%"><small>{log.user ? log.user.name : null}</small></td>
                                            <td width="55%"><small dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(log.log)}} /></td>
                                            <td width="25%" className="text-center"><small>{niceDateTime(log.created_at)}</small></td>
                                        </tr>
                                    ))
                                }
                                <tr>
                                    <td colSpan={3}>
                                        <Button size="sm" className="w-100" variant="outline-secondary" onClick={() => setExpandTable(!expandTable)}>
                                            { expandTable ? "Retract" : "Expand" }
                                        </Button>
                                    </td>
                                </tr>
                                </tbody>
                            </Table>
                        </Form.Group>
                        <Button size="sm" type="submit" variant="success" className="mt-4 w-100">Submit</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

function niceDateTime(timestamp) {
    const dateObject = new Date(timestamp);

    return dateObject.toLocaleDateString([],{year:"numeric", month:"long", day:"numeric"}) + " " +
        dateObject.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function niceQuote(str){
    return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

function shortQuote(str) {
    if (str.length <= 250)
        return str;

    return str.substring(0, 250) + "...";
}

function getBackgroundColor(status) {
    switch (status) {
        case 1:
            return "rgba(255, 255, 0, 0.05)";
        case 2:
            return "rgba(0, 255, 0, 0.05)";
        case 3:
            return "rgba(255, 0, 0, 0.05)"
        default:
            return "rgba(255, 255, 255, 0.05)"
    }
}

import {Button, Form, Modal} from "react-bootstrap";
import {useState} from "react";
import Swal from "sweetalert2";
import '@sweetalert2/theme-dark/dark.scss';

export default function (props) {
    const { show, onClose } = props;

    const [quote, setQuote] = useState(null);
    const [name, setName] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();

        e.target.disabled = true;

        const formData = new FormData();
        if (quote !== null && quote !== undefined)
            formData.append('content', quote);

        if (name !== null && name !== undefined)
            formData.append('name', name);

        await axios.post('/api/quotes', formData)
            .then((res) => {
                onClose();

                Swal.fire({
                    icon: "success",
                    text: "Your quote has been submitted successfully. If it's approved, it will popup here!"
                });
            }).catch((error) => {
                onClose();

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

    return (
        <>
            <Modal size="lg" show={show} onHide={onClose}>
                <Modal.Header className="justify-content-center">
                    <Modal.Title>Create Quote</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formQuote">
                            <Form.Control as="textarea" aria-required={true} aria-valuemax={65535} placeholder={"Enter quote here..."} onChange={(event => setQuote(event.target.value))} />
                            <Form.Text>Accepts <code>&lt;b&gt;</code> tags.</Form.Text>
                        </Form.Group>
                        <br />
                        <Form.Group controlId="formName">
                            <Form.Control aria-valuemax={255} placeholder={"Name for submission (optional)"} onChange={(event => setName(event.target.value))} />
                        </Form.Group>
                    </Form>
                    <Button size="sm" variant="success" className="mt-4 w-100" onClick={handleSubmit}>Submit</Button>
                </Modal.Body>
            </Modal>
        </>
    );
}

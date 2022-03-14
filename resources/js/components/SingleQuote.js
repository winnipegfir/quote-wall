import {useNavigate, useParams} from "react-router-dom";
import NoMatch from './404';
import {useEffect, useState} from "react";
import {faCopy, faShuffle, faSpinner} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import QuoteCard from "./QuoteCard";
import {Helmet, HelmetData} from "react-helmet-async";
import {Button, ButtonGroup, Col, Row} from "react-bootstrap";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import '@sweetalert2/theme-dark';
import {redirectToRandomQuote} from "../functions";

const helmetData = new HelmetData({});

export default function () {
    let { uuid } = useParams();
    const [ quote, setQuote ] = useState(null);
    const [ isLoaded, setLoaded ] = useState(false);
    const navigate = useNavigate();

    if (!uuid)
        return <NoMatch />

    useEffect(() => {

        axios.get("/api/quotes/" + uuid)
            .then((res) => {
                res = res.data

                if (res.success === undefined) {
                    setLoaded(true);
                    return;
                }

                setQuote(res.data);

                setLoaded(true);
            }).catch((err) => {
                console.log(err);
                setLoaded(true);
        })
    }, [window.location.pathname]);

    return (
        <>
            {
                quote && showQuote(quote, navigate)
            }
            {
                !isLoaded && (
                    <FontAwesomeIcon size="2x" icon={faSpinner} className="fa-spin" />
                )
            }
            {
                !quote && isLoaded && (
                    <NoMatch />
                )
            }
        </>
    )
}

function showQuote(quote, navigate) {
    return (
        <>
            <Helmet helmetData={helmetData}>
                <title>Quote by { quote.name ?? "Anonymous" }</title>
                <meta property="og:title" content={quote.name ?? "Anonymous" } />

                <meta property="description" content={quote.content} />
                <meta property="og:description" content={quote.content} />
            </Helmet>

            <div className="px-2 pb-2">
                <QuoteCard quote={quote} />
            </div>

            <Row>
                <Col sm={12} md={8} lg={6} xl={4} className="mx-auto">
                    <ButtonGroup className="w-100 px-2">
                        <Button variant="outline-secondary" onClick={() => copyLinkToClipboard(quote.uuid)}>
                            <FontAwesomeIcon icon={faCopy} />
                        </Button>
                        <Button variant="outline-secondary" onClick={() => redirectToRandomQuote(navigate)}>
                            <FontAwesomeIcon icon={faShuffle} />
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>
        </>
    );
}

function copyLinkToClipboard(uuid) {
    const shareLink = window.location.origin.toString() + "/quote/" + uuid;

    navigator.clipboard.writeText(shareLink).then(function() {
        Swal.fire({
            icon: "success",
            text: "Copied to clipboard!"
        });
    }, function() {
        Swal.fire({
            icon: "error",
            text: "Could not write to your clipboard."
        });
    });
}

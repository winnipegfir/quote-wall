import {Col, Container, Form, FormText, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import QuoteCard from "./QuoteCard";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {Helmet, HelmetData} from "react-helmet-async";
import Swal from "sweetalert2";

const helmetData = new HelmetData({});

export default function () {
    const [ url, setUrl ] = useState("/api/quotes?search=");
    const [ fetching, setFetching ] = useState(false);
    const [ isLoading, setLoading ] = useState(false);
    const [ end, setEnd ] = useState(false);
    const [ quotes, setQuotes ] = useState([]);
    const [ searchTerm, setSearchTerm ] = useState(null);

    async function getQuotes() {
        if (url == null) {
            return;
        }

        setLoading(true);

        await axios.get(url)
            .then((res) => {
                setQuotes(quotes => [...quotes, ...res.data.data]);

                if (res.data.next_page_url) {
                    setUrl(res.data.next_page_url);
                } else {
                    setEnd(true);
                    setUrl(null);
                }

                setFetching(false);
                setLoading(false);
            }).catch((err) => {
                if (err.response.status === 429) {
                    Swal.fire({
                        icon: "error",
                        text: `Too many requests. You are being rate limited. Try again in ${err.response.headers["retry-after"]} seconds.`
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        text: `An error occurred. Please refresh the page and try again.`
                    });
                }

                console.log(err.response);

                setFetching(false);
                setLoading(false);
            });
    }

    function handleScroll() {
        let userScrollHeight = window.innerHeight + window.scrollY;
        let windowBottomHeight = document.documentElement.offsetHeight - 500;

        if (userScrollHeight < windowBottomHeight)
            return;

        setFetching(true);
    }

    useEffect(() => {
        getQuotes();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [])

    useEffect(() => {
        const delayFunction = setTimeout(() => {
            if (searchTerm != null) {
                // Reset variables
                setEnd(false);
                setQuotes([]);

                // Search for quotes
                setUrl(`/api/quotes?search=${encodeURIComponent(searchTerm)}`);
                setFetching(true);
            }
        }, 400);

        return () => clearTimeout(delayFunction);
    }, [searchTerm]);

    useEffect(() => {
        if (!fetching)
            return;

        getQuotes();
    }, [fetching]);

    return (
        <div style={{ minHeight: "96vh" }}>
            <Helmet helmetData={helmetData}>
                <title>Winnipeg FIR Quotes</title>
                <meta property="description" content="All the greatest moments caught in the Winnipeg FIR... if you're on here somewhere, we're sorry." />
            </Helmet>

            <Container fluid>
                <Row className="justify-content-center mb-3">
                    <Col lg={6} md={12} aria-colspan={12}>
                        <Form>
                            <Form.Control type="search" placeholder="Search for a quote..." onChange={event => {setSearchTerm(event.target.value)}} />
                        </Form>
                    </Col>
                </Row>
                <Row>
                    {
                        quotes.length > 0 && (
                            quotes.map((quote) => (
                                <Col xl={3} lg={4} md={6} sm={12} className="mb-4" key={quote.uuid} >
                                    <QuoteCard quote={quote} copy={true} />
                                </Col>
                            ))
                        )
                    }
                    <Col md={12} className="mb-4 text-center">
                        { isLoading && (
                            <FontAwesomeIcon size="2x" icon={faSpinner} className="fa-spin" />
                        )}
                        {
                            end && (
                                <small className="text-white-50 fst-italic">You've reached the end... for <b>now</b></small>
                            )
                        }
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

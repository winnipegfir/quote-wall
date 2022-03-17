import {useOutletContext} from "react-router-dom";
import NoMatch from '../404';
import {Badge, Button, Card, Col, Dropdown, DropdownButton, Row} from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFilter, faRefresh} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";
import {Helmet, HelmetData} from "react-helmet-async";
import QuoteCard from "./QuoteCard";

export default function () {
    const [type, setType] = useState();
    const [quotes, setQuotes] = useState({});
    const [_, user] = useOutletContext();
    const helmetData = new HelmetData({});

    const [ numbers, setNumbers ] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 })

    useEffect(() => {
        axios.get('/api/admin/quotes/numbers')
            .then((res) => {
                setNumbers(res.data);
            }).catch((err) => {
                console.log(err)
            });
    }, []);

    async function handleFilterChange(e) {
        if (e.target.id === type)
            return;

        let newType = e.target.id
        setType(newType);

        // Get
        axios.get(`/api/admin/quotes/status/${newType}`)
            .then((res) => {
                setQuotes(res.data.data);
            }).catch((err) => {
                console.log(err)
        });
    }

    function reloadSelf() {
        if (type === undefined)
            return;

        axios.get(`/api/admin/quotes/status/${type}`)
            .then((res) => {
                setQuotes(res.data.data);
            }).catch((err) => {
            console.log(err)
        });

        axios.get('/api/admin/quotes/numbers')
            .then((res) => {
                setNumbers(res.data);
            }).catch((err) => {
            console.log(err)
        });
    }

    return (
        <>
            {user && user.is_admin || user.is_super_admin ? (
                <>
                    <Helmet helmetData={helmetData}>
                        <title>Winnipeg FIR Quotes</title>
                        <meta property="description" content="All the greatest moments caught in the Winnipeg FIR... if you're on here somewhere, we're sorry." />
                    </Helmet>

                    <Row className="justify-content-center">
                        <Col md={10} className="d-flex flex-column">
                            <div className="d-flex flex-row mb-2">
                                <DropdownButton className="d-flex flex-column me-2" title={<><FontAwesomeIcon icon={faFilter} /> Filter</>}>
                                    <Dropdown.Item onClick={handleFilterChange} id="all">
                                        All Quotes <Badge className="float-end mt-1 ms-2">{ numbers.all }</Badge>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={handleFilterChange} id="pending">
                                        Pending <Badge className="float-end mt-1 ms-2">{ numbers.pending }</Badge>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={handleFilterChange} id="approved">
                                        Approved <Badge className="float-end mt-1 ms-2">{ numbers.approved }</Badge>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={handleFilterChange} id="rejected">
                                        Rejected <Badge className="float-end mt-1 ms-2">{ numbers.rejected }</Badge>
                                    </Dropdown.Item>
                                </DropdownButton>

                                <Button className="flex-fill" variant="secondary" onClick={reloadSelf}>
                                    <FontAwesomeIcon icon={faRefresh}/> Reload
                                </Button>
                            </div>

                            <Row>
                                {
                                    quotes.length > 0 && quotes.map((quote) => (
                                        <Col xl={3} lg={4} md={6} sm={12} className="mb-4" key={quote.uuid} >
                                            <QuoteCard quote={quote} reload={reloadSelf} />
                                        </Col>
                                    ))
                                }
                            </Row>
                        </Col>
                    </Row>
                </>
            ) : (
                <NoMatch />
            )}
        </>
    );
}

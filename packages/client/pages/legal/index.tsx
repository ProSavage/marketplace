import Head from "next/head";
import styled from "styled-components";
import LegalNavbar from "../../components/views/legal/LegalNavbar"

export default function Legal() {
    return (
        <>
            <Head>
                <title>Legal - Marketplace</title>
                <meta name="description" content="Legal Documents"/>
            </Head>
            <LegalNavbar/>
            <Wrapper>
                <h1>Legal Documents</h1>
            </Wrapper>
        </>
    );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: 2em;
  margin: 1em 0;
`;


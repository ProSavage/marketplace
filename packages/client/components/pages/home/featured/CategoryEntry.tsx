import styled from "styled-components";
import { Category } from "../../../../types/Category";
import { getCategoryIconURL } from "../../../../util/cdn";
import useFallbackImageInSSR from "../../../../util/UseFallbackImageInSRR";

function CategoryEntry(props: {category: Category}) {

    return <Wrapper>
        <img src={getCategoryIconURL(props.category._id)} alt="" width="25px" height="25px"/>
        <Text>{props.category.name}</Text>
    </Wrapper>
}

export default CategoryEntry;

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`

const Text = styled.p`
    margin-left: 0.5em;
`
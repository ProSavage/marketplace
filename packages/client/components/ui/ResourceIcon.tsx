import styled from "styled-components";
import { DirectoryResource, Resource } from "../../types/Resource";
import { getResourceIconURL } from "../../util/cdn";
import Image from "next/image";
import useFallbackImageInSSR from "../../util/UseFallbackImageInSRR";

export default function ResourceIcon(props: { resource: Resource | DirectoryResource, size: string }) {
    // https://marketplace-savagelabs.b-cdn.net/resources/5fe543e4617b45c9499e40d1/icon.png
    // const fallback = "https://marketplace-savagelabs.b-cdn.net/defaults/default-icon.svg"
    const fallback = "/static/defaults/default-icon.svg"
    const fallbackImageProps = useFallbackImageInSSR(fallback)
    return <img src={props.resource?.hasIcon ? getResourceIconURL(props.resource._id) : fallback} alt="" height={props.size} width={props.size}
    {...fallbackImageProps}
    />
}

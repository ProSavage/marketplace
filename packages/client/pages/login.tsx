import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { userState } from "../atoms/user";
import Input from "../components/ui/Input";
import SecondaryButton from "../components/ui/Secondarybutton";
import PropsTheme from "../styles/theme/PropsTheme";
import getAxios, { buildAxios } from "../util/AxiosInstance";
import { setToken } from "../util/TokenManager";
import { validateEmail, validatePassword, validateUsername } from "../util/Validation";

export default function Login() {
  
  const [user, setUser] = useRecoilState(userState);

  const router = useRouter();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");

  const login = () => {
    if (!validateEmail(email) || !validatePassword(password)) {
      setErr("invalid email or password.")
      return;
    }


    getAxios() 
      .post("/auth/login", {
        email: email,
        password,
      })
      .then((res) => {
        setToken(res.data.payload.token)
        setUser(res.data.payload.user)
        buildAxios()
        router.push("/")
      })
      .catch((err) => setErr(err.response.data.error));
  };

  return (
    <Wrapper>
      <LoginContainer>
        <Header>Log in</Header>
        <Link href={"/signup"}>
          <p>
            Don't have an account yet?
            <CreateAccountLink>Create an account</CreateAccountLink>
          </p>
        </Link>
        <ErrorText>{err}</ErrorText>
        <InputContainer>
          <InputDivider>
            <label>EMAIL ADDRESS</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder={"Enter an email address"}
              invalid={!validateEmail(email)}
            />
          </InputDivider>
          <InputDivider>
            <label>PASSWORD</label>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder={"Enter an email address"}
              invalid={!validatePassword(password)}
            />
          </InputDivider>
          <InputDivider>
            <SecondaryButton
              type={"submit"}
              onClick={(e) => {
                e.preventDefault();
                login();
              }}
            >
              Log in
            </SecondaryButton>
          </InputDivider>
        </InputContainer>
      </LoginContainer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* max-width: 400px; */
  width: 100%;
  margin: 1em;
`;

const Header = styled.h1`
  font-size: 56px;
`;

const LoginContainer = styled.form`
  display: flex;
  flex-direction: column;
  padding: 2em;
  margin: 1em;
  max-width: 500px;
`;

const CreateAccountLink = styled.span`
  cursor: pointer;
  color: ${(props: PropsTheme) => props.theme.accentColor};
  padding: 0 5px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1em 0;
`;

const InputDivider = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.5em 0;
`;


const ErrorText = styled.p`
  color: ${(props: PropsTheme) => props.theme.errorColor};
`
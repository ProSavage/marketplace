import styled, { css } from "styled-components";
import { useState, useEffect } from "react";
import DarkTheme from "../../styles/theme/DarkTheme";
import LightTheme from "../../styles/theme/LightTheme";
import PropsTheme from "../../styles/theme/PropsTheme";
import ActiveLink from "./../ActiveLink";
import { Moon, Sun, User } from "react-feather";
import { useRecoilState } from "recoil";
import { themeState } from "../../atoms/theme";
import Button from "./Button";
import { useRecoilValue } from "recoil";
import { userState } from "../../atoms/user";

const links = [
  {
    link: "/",
    text: "HOME",
    mobileOnly: false,
  },
  {
    link: "/directory/resources/plugin",
    text: "RESOURCES",
    mobileOnly: false,
  },
  {
    link: "/authors",
    text: "AUTHORS",
    mobileOnly: false,
  },
  {
    link: "/login",
    text: "LOG IN",
    mobileOnly: true,
  },
  {
    link: "/signup",
    text: "SIGN UP",
    mobileOnly: true,
  },
];

export default function Navbar(props) {
  const [theme, setTheme] = useRecoilState(themeState);
  const user = useRecoilValue(userState);

  const [toggled, setToggled] = useState(false);
  const [width, setWidth] = useState(0);

  const isDesktop = () => {
    return width > 800;
  };

  const isMobile = () => {
    return !isDesktop();
  };

  useEffect(() => {
    // function defined to update our width
    function updateWidth() {
      if (isDesktop()) setToggled(false);
      setWidth(window.innerWidth);
    }

    // bind it to the resize event
    window.addEventListener("resize", updateWidth);
    // our state has a 0 at beginning, so we need to run update once.
    updateWidth();
    return () => window.removeEventListener("resize", updateWidth);
  });

  const getLinks = () => {
    return links.map((entry) => {
      if (entry.mobileOnly && width > 500) return;
      return (
        <LinkWrapper key={entry.link}>
          <ActiveLink href={entry.link}>
            <LinkText>{entry.text}</LinkText>
          </ActiveLink>
        </LinkWrapper>
      );
    });
  };

  return (
    <Wrapper>
      <Content>
        <LogoSection>
          <LogoText>Marketplace</LogoText>
          {!toggled && isDesktop() && <LinksWrapper>{getLinks()}</LinksWrapper>}
        </LogoSection>
        <AccountSection>
          {user ? (
            <LinkWrapper>
              <ActiveLink href={"/account"}>
                <AccountText>{user.username}</AccountText>
              </ActiveLink>
            </LinkWrapper>
          ) : (
            <AccountLoginSignUp>
              <LinkWrapper>
                <ActiveLink href={"/login"}>
                  <AccountText>Log In</AccountText>
                </ActiveLink>
              </LinkWrapper>
              <LinkWrapper>
                <ActiveLink href={"/signup"}>
                  <SignUpButton>Sign Up</SignUpButton>
                </ActiveLink>
              </LinkWrapper>
            </AccountLoginSignUp>
          )}

          <LinkWrapper
            style={{ paddingRight: "1em" }}
            onClick={() =>
              setTheme(theme === DarkTheme ? LightTheme : DarkTheme)
            }
          >
            {theme === DarkTheme ? <Moon /> : <Sun />}
          </LinkWrapper>
          {!isDesktop() && (
            <HamburgerButton onClick={() => setToggled(!toggled)} />
          )}
        </AccountSection>
      </Content>
      {toggled && isMobile() && <div>{getLinks()}</div>}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100vw;
  display: flex;
  flex-direction: column;
  /* This will basically push everything to left and right. */
  justify-content: center;
  align-items: center;

  /* Want a line instead of shadow in dark mode. */
  background: ${(props: PropsTheme) => props.theme.backgroundPrimary};
  border-bottom: 1px solid ${(props: PropsTheme) => props.theme.borderColor};
  /* Box shadow for light mode. */
`;

const LogoText = styled.p`
  font-size: 20px;
  font-weight: bold;
`;

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.5em 0.5em;
  justify-content: space-between;

  @media (min-width: 800px) {
    justify-content: space-between;
    flex-direction: row;
  }
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 15px;

  @media (min-width: 800px) {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: auto;
  }
`;

const HamburgerButton = styled.div`
  width: 25px;
  height: 10px;
  border-top: 1px solid ${(props: PropsTheme) => props.theme.color};
  border-bottom: 1px solid ${(props: PropsTheme) => props.theme.color};
  padding: 5px;
`;

const LinkWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 5px;
`;

const LinksWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  padding: 0 15px;

  @media (min-width: 800px) {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: auto;
  }
`;

const LinkText = styled.p`
  font-size: 1rem;
  cursor: pointer;

  @media (min-width: 800px) {
    padding: 0 15px;
  }
`;

const AccountSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 15px;
`;

const AccountText = styled.p`
  font-size: 1.1em;
  display: flex;
  justify-content: center;
`;

const SignUpButton = styled(Button)`
  background: black !important;
  color: ${(props: PropsTheme) => props.theme.accentColor} !important;
  /* box-shadow: 0px 5px 7px rgba(0, 0, 0, 0.28); */
  padding: 15px 20px !important;
  cursor: pointer;
`;

const AccountLoginSignUp = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 10px;

  @media (max-width: 500px) {
    display: none;
  }
`;

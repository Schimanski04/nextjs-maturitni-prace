"use client";

import { IconArrowUp } from "@tabler/icons-react";
import { useWindowScroll, useViewportSize } from "@mantine/hooks";
import { Affix, Button, Text, Transition, rem } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import classes from "./ScrollToTopButton.module.css";

const ScrollToTopButton = () => {
  const [scroll, scrollTo] = useWindowScroll();
  const { height } = useViewportSize();
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <Affix position={{ bottom: 20, right: 20 }}>
      <Transition transition="slide-up" mounted={scroll.y > (height / 2)}>
        {(transitionStyles) => (
            isMobile === false ? (
              <Button
                style={transitionStyles}
                leftSection={<IconArrowUp style={{ width: rem(16), height: rem(16) }} />}
                onClick={() => scrollTo({ y: 0 })}
              >
                Scroll to top
              </Button>
            ) : (
              <Button
                style={transitionStyles}
                className={classes.button}
                onClick={() => scrollTo({ y: 0 })}
              >
                <IconArrowUp style={{ width: rem(18), height: rem(18) }} />
              </Button>
            )
        )}
      </Transition>
    </Affix>
  );
}

export default ScrollToTopButton;

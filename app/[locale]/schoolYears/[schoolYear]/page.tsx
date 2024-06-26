"use client";

import axios from "axios";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

import Breadcrumbs from "@/components/Breadcrumbs";
import DirectoryCard from "@/components/DirectoryCard";
import SearchBar from "@/components/SearchBar";
import {
  Anchor,
  Button,
  Center,
  Flex,
  Grid,
  Group,
  Loader,
  Modal,
  rem,
  Title,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useDocumentTitle } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconTrash, IconX } from "@tabler/icons-react";

export default function ClassesPage({ params }: { params: { schoolYear: number } }) {
  const t = useTranslations("ClassesPage");
  useDocumentTitle(`${t("tabTitle")} (${params.schoolYear})`);
  const router = useRouter();
  const locale = useLocale();
  const p = useTranslations("Pathnames");
  const theme = useMantineTheme();
  const [schoolYear, setSchoolYear] = useState<SchoolYear>();
  const [clazzes, setClazzes] = useState<Array<Clazz>>([]);
  const [filteredClazzes, setFilteredClazzes] = useState<Array<Clazz>>([]);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [opened, { open, close }] = useDisclosure(false);

  const breadcrumbsItems = [
    { title: t("breadcrumbs.home"), href: `/${locale}` },
    {
      title: t("breadcrumbs.schoolYears"),
      href: `/${locale}/${p("schoolYears")}`,
    },
    {
      title: `${params.schoolYear}`,
      href: `/${locale}/${p("schoolYears")}/${params.schoolYear}`,
    },
  ].map((item) => (
    <Anchor
      component={Link}
      href={item.href}
      key={uuid()}
      c={theme.colors.pslib[6]}
    >
      {item.title}
    </Anchor>
  ));

  useEffect(() => {
    const dataPromise = axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/cs/api/schoolYears/${params.schoolYear}`
      )
      .then((res) => {
        const data = res.data;
        setSchoolYear(data);
        setClazzes(data.clazzes);
        setFilteredClazzes(data.clazzes);
      });

    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1000));

    Promise.all([dataPromise, timeoutPromise]).then(() => setLoading(false));
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const filteredResults = clazzes.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredClazzes(filteredResults);
  };

  const handleDeleteSchoolYear = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/cs/api/photos`, {
        params: {
          schoolYear: params.schoolYear,
        },
      });
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/cs/api/schoolYears/${params.schoolYear}`
      );

      router.push(`/${locale}/${p("schoolYears")}`);
      notifications.show({
        color: "teal",
        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
        title: t("notification.success.title"),
        message: t("notification.success.message", { schoolYear: params.schoolYear }),
        autoClose: 4000,
      });
    } catch (err) {
      router.push(`/${locale}/${p("schoolYears")}`);
      notifications.show({
        color: "red",
        icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
        title: t("notification.error.title"),
        message: t("notification.error.message", { schoolYear: params.schoolYear }),
        autoClose: 4000,
      });
    }
  };

  return (
    <>
      <Flex direction="row" justify="space-between" align="center">
        <Breadcrumbs items={breadcrumbsItems} />
        <UnstyledButton w={24} h={24} onClick={open}>
          <IconTrash stroke={1.4} />
        </UnstyledButton>
      </Flex>

      <SearchBar
        placeholder={t("searchBar.placeholder")}
        handleSearch={handleSearch}
      />

      {loading === true ? (
        <Center>
          <Loader color={theme.colors.pslib[6]} />
        </Center>
      ) : filteredClazzes.length === 0 ? (
        <Center>
          <Title order={1}>{t("title")}</Title>
        </Center>
      ) : (
        <Grid>
          {filteredClazzes.map((c) => (
            <Grid.Col span={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={uuid()}>
              <DirectoryCard
                entity={c}
                model="clazz"
                clazzNameParam={params.schoolYear}
                textToHighlight={query}
              />
            </Grid.Col>
          ))}
        </Grid>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={t("modal.title")}
        centered
        radius="md"
        zIndex={1000}
      >
        {t("modal.text")}
        <Group justify="center" mt="xl">
          <Button color="red" onClick={handleDeleteSchoolYear}>
            {t("modal.leftButton")}
          </Button>
          <Button variant="default" onClick={close}>
            {t("modal.rightButton")}
          </Button>
        </Group>
      </Modal>
    </>
  );
}

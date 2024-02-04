"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import axios from "axios";

import Breadcrumbs from "@/components/Breadcrumbs";
import DirectoryCard from "@/components/DirectoryCard";
import SearchBar from "@/components/SearchBar";
import { Anchor, Center, Grid, Loader, Title, useMantineTheme } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { v4 as uuidv4 } from "uuid";

export default function SchoolYearsPage() {
  useDocumentTitle("School years");
  const locale = useLocale();
  const t = useTranslations("SchoolYearsPage");
  const theme = useMantineTheme();
  const [years, setYears] = useState<Year[]>([]);
  const [filteredYears, setFilteredYears] = useState<Year[]>([]);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  
  const breadcrumbsItems = [
    { title: t("breadcrumbs.home"), href: `/${locale}` },
    { title: t("breadcrumbs.schoolYears"), href: `/${locale}/years` },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={uuidv4()} c={theme.colors.pslib[6]}>
      {item.title}
    </Anchor>
  ));

  useEffect(() => {
    let dataLoaded = false;

    setTimeout(() => {
      if (dataLoaded) {
        setLoading(false);
      }
    }, 1000);

    axios.get(`/${locale}/api/years`)
      .then((res) => {
        const data = res.data;
        setYears(data);
        setFilteredYears(data);
        dataLoaded = true;
      });
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const filteredResults = years.filter((y) =>
      y.year.toString().includes(searchQuery)
    );

    setFilteredYears(filteredResults);
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbsItems} />
      <SearchBar
        placeholder={t("searchBar.placeholder")}
        handleSearch={handleSearch}
      />

      {
        loading === true ? (
          <Center>
            <Loader color={theme.colors.pslib[6]} />
          </Center>
        ) : (
          filteredYears.length === 0 ? (
            <Center>
              <Title order={1}>No years found</Title>
            </Center>
          ) : (
            <Grid>
              {
                filteredYears.map((y) => (
                  <Grid.Col span={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={uuidv4()}>
                    <DirectoryCard entity={y} type="year" textToHighlight={query} />
                  </Grid.Col>
                ))
              }
            </Grid>
          )
        )
      }
    </>
  );
}
import { useEffect, useState } from "preact/compat";
import { useLazyQuery } from "@apollo/client";
import { GET_BLOGS } from "@queries";
import { default as Grid } from "@mui/material/Unstable_Grid2";
import {
  BlogListSkelleton,
  NoResultsWithIcon,
  QueryErrorWithIcon,
} from "@components";

import {
  blogListResponseTransformer,
  blogMetaTransformer,
  type metaProps,
  sanitizeLanguage,
  type singleBlogProps,
} from "@utils";

import type { VNode } from "preact";

import BlogGrid from "../blog-grid/BlogGrid";
import Categories from "../categories/Categories";
import Pagination from "../pagination/Pagination";
import { useTranslation } from "react-i18next";
import { useSearch } from "@tanstack/react-router";

type BlogListProps = {
  pageSize?: number;
  categories?: boolean;
  pagination?: boolean;
};

const BlogList = ({
  pageSize = 3,
  categories: showCategories = false,
  pagination = false,
}: BlogListProps): VNode => {
  const { i18n, t } = useTranslation();
  const { pathname } = window.location;
  const { page, categories } = useSearch();
  const [blogEntries, setBlogEntries] = useState<singleBlogProps[] | null>(
    null
  );
  const [meta, setMeta] = useState<metaProps | null>(null);

  const [getBlogList, { loading, error, data }] = useLazyQuery(GET_BLOGS, {
    variables: {
      pagination: {
        page,
        pageSize,
      },
      filters:
        categories !== "" && categories !== "all"
          ? { Categories: { Slug: { eq: categories } } }
          : null,
      locale: sanitizeLanguage(),
    },
  });

  useEffect(() => {
    if (data) {
      setBlogEntries(blogListResponseTransformer(data));
      setMeta(blogMetaTransformer(data));
    }
  }, [data]);

  useEffect(() => {
    getBlogList();
  }, [getBlogList, page, categories, i18n.language]);

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      {showCategories && <Categories pathname={pathname} />}
      {loading ? <BlogListSkelleton amount={3} /> : null}
      {error ? <QueryErrorWithIcon message={t("errorBlogs")} /> : null}
      {blogEntries?.length && !loading && !error ? (
        <BlogGrid blogs={blogEntries} />
      ) : null}
      {blogEntries?.length === 0 && !loading && !error ? (
        <NoResultsWithIcon message={t("noResultsBlogs")} />
      ) : null}
      {pagination && meta?.pageCount ? (
        <Pagination meta={meta} pathname={pathname} />
      ) : null}
    </Grid>
  );
};

export default BlogList;

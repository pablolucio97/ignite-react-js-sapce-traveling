import { GetStaticProps } from 'next';
import styles from './home.module.scss';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FiCalendar, FiUser } from 'react-icons/fi'
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import { useState } from 'react';



interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  return (
    <>
      <main className={styles.container}>
        <img src='logo.svg' alt="logo" />
        {postsPagination.results.map(post => (
          <div className={styles.container}>
            <a href={post.uid}>
              <h1>{post.data.title}</h1>
            </a>
            <h3>{post.data.subtitle}</h3>
            <div className={styles.dateContainer}>
              <time><FiCalendar style={{ marginRight: 8 }} />15 mar 2021</time>
              <span><FiUser style={{ marginRight: 8 }} />Pablo Lúcio</span>
            </div>
          </div>
        ))}
        <button>Carregar mais posts</button>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 3
  })

  const results = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  return {
    props: {
      postsPagination: {
        results
      }
    }
  }

}


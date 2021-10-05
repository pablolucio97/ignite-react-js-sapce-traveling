import { GetStaticProps } from 'next';
import styles from './home.module.scss';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FiCalendar, FiUser } from 'react-icons/fi'
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import { useState } from 'react';
import { parseISO } from 'date-fns';
import Link from 'next/link';

import Header from '../components/Header'

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

  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);


  function loadMorePost(): void {
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const newPosts = data.results.map(post => {
          return {
            uid: post.uid,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
            first_publication_date: post.first_publication_date,
          }
        })

        setNextPage(data.next_page)
        setPosts([...posts, ...newPosts])

      })
  }


  return (
    <>
      <main className={styles.container}>
        <Header />
        {posts.map(post => (
          <div className={styles.container}>
            <Link href={`/post/${post.uid}`}>
              <a>{post.data.title}</a>
            </Link>
            <h3>{post.data.subtitle}</h3>
            <div className={styles.dateContainer}>
              <span><FiCalendar style={{ marginRight: 8 }} />
                {
                  format(parseISO(post.first_publication_date), 'dd MMM yyyy', { locale: ptBR })
                }</span>
              <time><FiUser style={{ marginRight: 8 }} />{post.data.author}</time>
            </div>
          </div>
        ))}
        {



          posts.length >= 4 ?
            null
            :
            <button onClick={loadMorePost}>Carregar mais posts</button>
        }
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
    pageSize: 1
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
        results,
        next_page: response.next_page
      }
    }
  }

}


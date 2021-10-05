import { getPrismicClient } from '../../services/prismic';
import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom'
import { FiClock, FiCalendar, FiUser } from 'react-icons/fi'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { useRouter } from 'next/router'
import Prismic from '@prismicio/client'
import Link from 'next/link'

import Header from '../../components/Header'
import styles from './post.module.scss';
import UtterancComment from '../../components/UtterancComment'

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostNeighborhood {
  title: string;
  uid: string;
}
interface PostProps {
  post: Post;
  preview: boolean;
  prevPost: PostNeighborhood;
  nextPost: PostNeighborhood;
}

export default function Post({ post, preview, prevPost, nextPost }: PostProps) {

  const router = useRouter()

  if (router.isFallback) {
    return (
      <h2>Carregando...</h2>
    )
  }


  const totalWords = post.data.content.reduce((acc, content) => {
    acc += content.heading.split(' ').length

    const words = content.body.map(item => item.text.split('').length)
    words.map(word => (acc += word))

    return acc
  }, 0)

  const readingTime = `${Math.ceil(totalWords / 200).toString()} min`



  return (
    <div className={styles.container}>
      <Header
      />
      <img src={post.data.banner.url} alt="space-travelling" />
      <div>
        <h1 id={styles.title}>{post.data.title}</h1>
      </div>
      {post.data.content.map(({ heading, body }) => (
        <div className={styles.postContent}>
          <div className={styles.postInfoContainer}>
            <span><FiCalendar style={{ marginRight: 8 }} />
              {
                format(parseISO(post.first_publication_date), 'dd MMM yyy', { locale: ptBR })
              }
            </span>
            <span><FiUser style={{ marginRight: 8 }} />{post.data.author}</span>
            <span><FiClock style={{ marginRight: 8 }} />{readingTime}</span>
          </div>
          <div className={styles.lastEditContainer}>
            <span>
              {
                format(parseISO(post.last_publication_date), "'* Editado em 'dd MMM yyyy', às 'hh:mm", { locale: ptBR })
              }
            </span>
          </div>
          <div key={heading} className={styles.heading}>
            <h2>{heading}</h2>
            <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
          </div>
        </div>
      ))}
      <div className={styles.prevNextPost}>
        <div className={styles.postsPagination}>
          <div>
            {prevPost && (
              <>
                <p>{prevPost.title}</p>
                <Link href={`/post/${prevPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            )}
          </div>

          <div>
            {nextPost && (
              <>
                <p>{nextPost.title}</p>
                <Link href={`/post/${nextPost.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <UtterancComment />
    </div>
  )
}

export const getStaticPaths = async () => {

  const prismic = await getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 3
    }
  )

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  })

  return {
    paths: paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params, preview = false }) => {

  const prismic = getPrismicClient();

  const { slug } = params

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.url || 'https://images.prismic.io/space-traveling-pablolucio/66c273cd-5356-435a-bb0f-cc2165720fee_banner.png?auto=compress',
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  const prevPost = await prismic.query(Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: response.uid,
      orderings: '[document.first_publication_date]'
    })

  const nextPost = await prismic.query(Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 1,
      after: response.uid,
      orderings: '[document.first_publication_date desc]'
    })

  return {
    props: {
      post,
      preview,
      nextPost:
        slug === prevPost.results[0].uid ? null : {
          title: prevPost.results[0].data.title,
          uid: prevPost.results[0].uid,
        },
      prevPost:
        slug === nextPost.results[0].uid ? null : {
          title: nextPost.results[0].data.title,
          uid: nextPost.results[0].uid,
        }
    },
    revalidate: 60 * 60
  }
};

import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Head from 'next/head';
import React from 'react';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { formatDate } from '../../../date';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url?: string;
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

interface PostProps {
  post: Post;
}

export default function Post( { post }: PostProps) {
  const router = useRouter()

  if ( router.isFallback ){
    return <h1>Carregando...</h1>
  }

  return (
    <div>
      <Head>
        <title> { post.data.title } | spacetravelling </title>
      </Head>

      <img className={styles.banner} src={post.data.banner.url}  alt={post.data.author} />
      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1 className={styles.title}> { post.data.title }</h1>
          <div className={styles.subtitle}>
            <div>
              <FiCalendar />
              <p>{formatDate(post.first_publication_date)}</p>
            </div>
            <div>
              <FiUser />
              <p>{ post.data.author }</p>
            </div>
            <div>
              <FiClock />
              <time>4min</time>
            </div>
          </div>
          {post.data.content.map(content => {
            return (
                <div
                className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                ></div>
            );
          })}
        </article>
      </main>

    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      }
    }
  })

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params
  const response = await prismic.getByUID('posts', String(slug), {});



  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner?.url || 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fnz%2Fsearch%3Fk%3Dno%2Bimage%2Bavailable&psig=AOvVaw3ksM7HJeHQiMXG5kaNb6JR&ust=1637293551145000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCLik0Pj_oPQCFQAAAAAdAAAAABAD',
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    }
  }


  return {
    props: {
      post
    }
  }
};

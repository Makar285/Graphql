const body = document.querySelector(".body");
let mainCurrentPage = 1;
const limit = 2;
let allPosts = [];

function userLogin(status) {
  body.innerHTML = `
  <p class="status">Status: ${status}</p>

  <ol>
    <li><button class="one">ONE</button></li>
    <br><br>
    <li>
      <form action="http://localhost:8080/feed/post" method="POST">
        <label for="title">Title</label>
        <input class="title" type="text" name="title" id="title"><br>

        <label for="content">Content</label>
        <input class="content" type="text" name="content" id="content"><br>

        <input type="file" name="image" class="image1"><br>

        </form>
      <button type="button" class="two">TWO</button>
    </li>
    <br><br>
    <li>
      <form>
        <label for="postId">PostId</label>
        <input class="postId" type="number" id="postId" name="postId"><br>
      </form>
      <button class="three">THREE</button>
    </li>
    <br><br>
    <li>
      <form>
        <label for="postIdForUpdate">PostIdForUpdate</label>
        <input class="postIdForUpdate" type="number" id="postIdForUpdate" name="postIdForUpdate"><br>

        <label for="newTitle">New Title</label>
        <input class="newTitle" type="text" name="newTitle" id="newTitle"><br>

        <label for="newContent">New Content</label>
        <input class="newContent" type="text" name="newContent" id="newContent"><br>

        <input type="file" name="image" class="image2"><br>
      </form>
      <button class="four">FOUR</button>
    </li>
    <br><br>
    <li>
      <form>
        <label for="deletePost">IdForDeletePost</label>
        <input type="number" id="deletePost" class="postIdForDelete" name="idForDeletePost">
      </form>
      <button class="five">FIVE</button>
    </li>
    <br><br>
    <li>
      <form>
        <label for="newStatus">New Status</lable>
        <input type="text" name="newStatus" class="newStatus" id="newStatus">
      </form>
      <button class="six" type="button">SIX</button>
    </li>
  </ol>

  <button class="logout">Logout</button>

  <div>RESULT:
    <div class="root"></div>
  </div>

  <div class="paginationButtons"></div>

  <div class="paginationPosts"></div>
  
  <div>ERRORS: 
    <div class="errors"></div>
  </div>

  <button class="clean">cLEAN</button>

  <script src="./script.js"></script>
  `;
}

function userNotLogin() {
  localStorage.removeItem("token");
  body.innerHTML = `
  <ol>
    <li>
      <form>
        <label for="name">Name</label>
        <input class="name" type="text" name="name" id="name"><br>

        <label for="email">Email</label>
        <input class="email" type="email" name="email" id="email"><br>

        <label for="password">Password</label>
        <input class="password" type="password" name="password" id="password"><br>

        <label for="confirmPassword">Confirm Password</label>
        <input class="confirmPassword" type="password" name="confirmPassword" id="confirmPassword"><br>
      </form>
      <button type="button" class="signup">Signup</button>
    </li>
    <br><br>
    <li>
      <form>
        <label for="emailForLogin">Email</label>
        <input class="emailForLogin" type="email" name="emailForLogin" id="emailForLogin"><br>

        <label for="passwordForLogin">Password</label>
        <input class="passwordForLogin" type="password" name="passwordForLogin" id="passwordForLogin"><br>
      </form>
      <button type="button" class="login">Login</button>
    </li>
  </ol>

  <div>RESULT:
    <div class="root"></div>
  </div>

  <div>ERRORS: 
    <div class="errors"></div>
  </div>

  <button class="clean">cLEAN</button>

  <script src="./script.js"></script>
  `;
}

function valueNotImg(value, isValid) {
  const p = document.createElement("p");
  p.textContent = value;

  if (isValid) {
    p.style = "font-size: 12px; color: lime;";
    const root = document.querySelector(".root");
    root.appendChild(p);
  } else {
    p.style = "font-size: 15px; color: red;";
    const errors = document.querySelector(".errors");
    errors.appendChild(p);
  }
}

function valueForImg(data, src, alt, textContent, otherContainer = false) {
  const p = document.createElement("p");
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  p.textContent = textContent;
  p.appendChild(img);
  p.style = "font-size: 12px; color: lime;";
  console.log(p);

  if (otherContainer) {
    otherContainer.appendChild(p);
  } else {
    const root = document.querySelector(".root");
    root.appendChild(p);
  }
}

function errorsFromServer(data) {
  console.log(data);
  valueNotImg(
    `message: ${data.errors[0].message}, status: ${data.errors[0].statusCode}`,
    false,
  );
  if (data.errors[0].data && data.errors[0].data.length > 0) {
    for (const err of data.errors[0].data) {
      valueNotImg(`message: ${err.message}, value: ${err.value}`, false);
    }
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  const token = localStorage.getItem("token");
  console.log("token in localSorage", token);

  if (token) {
    const graphqlQuery = {
      query: `
        query Main($token: String!{
          main(token: $token) {
            status
          }
        }
      `,
	  variables: {
		  token
	  }
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        Authorization: token ? "Bearer " + token : "",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((data) => data.json())
      .then((data) => {
        console.log(data);

        if (data.type === "text") {
          userNotLogin();
          valueNotImg(data.result, false);
        } else if (data.errors && data.errors.length > 0) {
          userNotLogin();
        } else {
          userLogin(data.data.main.status);
        }
      })
      .catch((err) => console.log(err));
  } else {
    userNotLogin();
  }
});

body.addEventListener("click", (e) => {
  if (e.target.closest(".one")) {
    const token = localStorage.getItem("token") || "";

    const graphqlQuery = {
      query: `
        query GetPostsforCurrentPage($page: Int!){
          getAllPosts(page: $page) {
            countPosts
            posts {
              post_id
              title
              content
              image_url
              creator_user_id
              post_created_at
              user_id
              name
              email
              password
              status
              user_created_at
            }
          }
        }
      `,
	  variables: {
		  page: 1
	  }
    };

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        Authorization: token ? "Bearer " + token : "",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((data) => data.json())
      .then((data) => {
        console.log(data);
        console.log(data.data);

        if (data.result === "Срок действия jwt токена истек.") {
          userNotLogin();
        } else if (data.errors && data.errors.length > 0) {
          errorsFromServer(data);
        } else {
          allPosts = data.data.getAllPosts;
          console.log(allPosts);

          const errors = document.querySelector(".errors");
          errors.innerHTML = "";

          function renderPosts(currentPage) {
            console.log(currentPage);
            const graphqlQuery2 = {
              query: `
                query FetchPosts($page: Int!) {
                  getAllPosts(page: $page) {
                    countPosts
                    posts {
                      post_id
                      title
                      content
                      image_url
                      creator_user_id
                      post_created_at
                      user_id
                      name
                      email
                      password
                      status
                      user_created_at
                    }
                  }
                }
              `,
			  variables: {
				  page: currentPage
			  }
            };
            fetch("http://localhost:8080/graphql", {
              method: "POST",
              headers: {
                // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
                Authorization: token ? "Bearer " + token : "",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(graphqlQuery2),
            })
              .then((data) => data.json())
              .then((data) => {
                const allPosts = data.data.getAllPosts;

                const paginationContainerPosts =
                  document.querySelector(".paginationPosts");
                console.log(paginationContainerPosts);
                paginationContainerPosts.innerHTML = "";

                for (const el of allPosts.posts) {
                  console.log(el);
                  const currentData = el;
                  valueForImg(
                    currentData,
                    `http://localhost:8080/${decodeURIComponent(currentData.image_url)}`,
                    currentData.title,
                    `id: ${currentData.post_id}, title: ${currentData.title}, content: ${currentData.content}, image_url: ${currentData.image_url}, creator_user_id: ${currentData.creator_user_id}, post_created_at: ${currentData.post_created_at}, creator_id: ${currentData.user_id}, creator_name: ${currentData.name}, creaor_email: ${currentData.email}, creator_password: ${currentData.password}, creator_status: ${currentData.status}, createdAt: ${currentData.user_created_at}`,
                    paginationContainerPosts,
                  );
                }
              });
          }

          function renderButtons(allPosts, currentPage) {
            const paginationContainerButtons =
              document.querySelector(".paginationButtons");
            paginationContainerButtons.innerHTML = "";

            const countButtons = Math.ceil(allPosts.countPosts / limit);
            console.log(countButtons, currentPage);

            const afterPage = currentPage + 1;
            const beforePage = currentPage - 1;

            let firstPage = false;
            let lastPage = false;
            let otherPage = false;
            let afterPageNotEqualLastPage = false;
            let beforePageNotEqual1 = false;

            if (currentPage === 1) {
              firstPage = true;
              afterPageNotEqualLastPage = true;
            } else if (countButtons === currentPage) {
              beforePageNotEqual1 = true;
              lastPage = true;
            } else {
              beforePageNotEqual1 = true;
              otherPage = true;
              afterPageNotEqualLastPage = true;
            }

            console.log(
              countButtons,
              afterPage,
              beforePage,
              firstPage,
              lastPage,
              otherPage,
              afterPageNotEqualLastPage,
              beforePageNotEqual1,
            );

            function renderButtonsByArray(notMainCurrentPage, array) {
              console.log(notMainCurrentPage, array);
              console.log(notMainCurrentPage, array);

              let i = notMainCurrentPage;
              for (const el of array) {
                const button = document.createElement("button");

                let targetPageNumber;
                if (el === "beforePage") {
                  targetPageNumber = notMainCurrentPage - 1;
                } else if (el === "page") {
                  targetPageNumber = notMainCurrentPage;
                } else {
                  targetPageNumber = notMainCurrentPage + 1;
                }

                button.textContent = "Страница номер " + targetPageNumber;
                button.dataset.id = targetPageNumber;

                if (targetPageNumber === notMainCurrentPage) {
                  button.style = "color: aqua; background-color: brown";
                }

                button.addEventListener("click", (e) => {
                  console.log(button, e.target, mainCurrentPage, allPosts);
                  mainCurrentPage = +button.dataset.id;
                  console.log("cunretPgae", mainCurrentPage, i);
                  renderPosts(mainCurrentPage);
                  renderButtons(allPosts, mainCurrentPage);
                });

                paginationContainerButtons.appendChild(button);
                i++;
              }
            }

            if (firstPage) {
              if (afterPageNotEqualLastPage) {
                renderButtonsByArray(currentPage, ["page", "afterPage"]);
              } else {
                renderButtonsByArray(currentPage, ["page"]);
              }
            } else if (lastPage) {
              if (beforePageNotEqual1) {
                renderButtonsByArray(currentPage, ["beforePage", "page"]);
              } else {
                renderButtonsByArray(currentPage, ["page"]);
              }
            } else {
              if (beforePageNotEqual1 && afterPageNotEqualLastPage) {
                renderButtonsByArray(currentPage, [
                  "beforePage",
                  "page",
                  "afterPage",
                ]);
              } else if (beforePageNotEqual1) {
                renderButtonsByArray(currentPage, ["beforePage", "page"]);
              } else if (afterPageNotEqualLastPage) {
                renderButtonsByArray(currentPage, ["page", "afterPage"]);
              } else {
                renderButtonsByArray(currentPage, ["page"]);
              }
            }
          }

          renderButtons(allPosts, mainCurrentPage);
          renderPosts(mainCurrentPage);
        }
      })
      .catch((err) => console.log(err));
  } else if (e.target.closest(".two")) {
    const titleInput = document.querySelector(".title");
    const contentInput = document.querySelector(".content");
    const imageInput1 = document.querySelector(".image1");
    const token = localStorage.getItem("token") || "";

    const formData = new FormData();

    // formData.append('title', titleInput.value);
    // formData.append('content', contentInput.value);

    if (imageInput1.files[0]) {
      formData.append("image", imageInput1.files[0]);
    } else {
      const errors = document.querySelector(".errors");
      errors.innerHTML =
        '<p style="font-size: 15px; color: red;">Пожалуйста, выберите файл</p>';
      return;
    }

    fetch("http://localhost:8080/post-image", {
      method: "PUT",
      body: formData,
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        Authorization: token ? "Bearer " + token : ""
      },
    })
    .then((data) => data.json())
    .then((data) => {
      console.log(data);

      if (data.type === "text") {
        valueNotImg(data.result, false);
      } else {
        const image_url = data.filePath;

        const graphqlQuery = {
          query: `
            mutation NewPost($title: String!, $content: String!, $image_url: String!) {
              createPost(title: $title, content: $content, image_url: $image_url) {
                message
                post_id
                title
                content
                image_url
                creator_user_id
                post_created_at
                user_id
                name
                email
                password
                status
                user_created_at
              }
            }
          `,
		  variables: {
			  title: titleInput.value,
			  content: contentInput.value,
			  image_url: image_url
		  }
        };

        fetch("http://localhost:8080/graphql", {
          method: "POST",
          body: JSON.stringify(graphqlQuery),
          headers: {
            "Content-Type": "application/json",
            // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
            Authorization: token ? "Bearer " + token : "",
          },
        })
        .then((data) => data.json())
        .then((data) => {
          console.log(data);

          const errors = document.querySelector(".errors");
          errors.innerHTML = "";

          if (data.result === "Срок действия jwt токена истек.") {
          userNotLogin();
          } else if (data.errors && data.errors.length > 0) {
            errorsFromServer(data);
          } else {
            const currentData = data.data.createPost;
            valueForImg(
              currentData,
              `http://localhost:8080/${decodeURIComponent(currentData.image_url)}`,
              currentData.title,
              `message: ${currentData.message}, id: ${currentData.post_id}, title: ${currentData.title}, content: ${currentData.content}, image_url: ${currentData.image_url}, creator_user_id: ${currentData.creator_user_id}, post_created_at: ${currentData.post_created_at}, creator_id: ${currentData.user_id}, creator_name: ${currentData.name}, creaor_email: ${currentData.email}, creator_password: ${currentData.password}, creator_status: ${currentData.status}, createdAt: ${currentData.user_created_at}`,
            );

            titleInput.value = contentInput.value = "";
          }
        })
        .catch((err) => console.log(err));
      }
    })
	.catch(err=>console.log(err));
  } else if (e.target.closest(".three")) {
    const postIdInput = document.querySelector(".postId");
    const token = localStorage.getItem("token") || "";

    const postId = postIdInput.value;
    console.log(postId);
    if(!postId) {
      return valueNotImg('Введите id поста.', false);
    }

    const graphqlQuery = {
      query: `
        query GetOnePostById($posId: Int!) {
          getPostById(postId: $postId) {
            post_id
            title
            content
            image_url
            creator_user_id
            post_created_at
            user_id
            name
            email
            password
            status
            user_created_at
          }
        }
      `,
	  variables: {
		  postId
	  }
    };

    fetch(`http://localhost:8080/graphql`, {
      method: "POST",
      body: JSON.stringify(graphqlQuery),
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        Authorization: token ? "Bearer " + token : "",
        "Content-Type": "application/json"
      },
    })
      .then((data) => data.json())
      .then((data) => {
        console.log(data);

        const errors = document.querySelector(".errors");
        errors.innerHTML = "";

        if (data.result === "Срок действия jwt токена истек.") {
          userNotLogin();
        } else if (data.error && data.type === "postNotFound") {
          valueNotImg(`message: ${data.message}`, false);
        } else if (data.type === "text") {
          valueNotImg(data.result, false);
        } else {
          postIdInput.value = '';
          const currentData = data.data.getPostById;
          valueForImg(currentData, `http://localhost:8080/${decodeURIComponent(currentData.image_url)}`, currentData.title, `id: ${currentData.post_id}, title: ${currentData.title}, content: ${currentData.content}, image_url: ${currentData.image_url}, creator_user_id: ${currentData.creator_user_id}, post_created_at: ${currentData.post_created_at}, creator_id: ${currentData.user_id}, creator_name: ${currentData.name}, creaor_email: ${currentData.email}, creator_password: ${currentData.password}, creator_status: ${currentData.status}, createdAt: ${currentData.user_created_at}`);
        }
      })
      .catch((err) => console.log(err));
  } else if (e.target.closest(".four")) {
    const newTitleInput = document.querySelector(".newTitle");
    const newContentInput = document.querySelector(".newContent");
    const imageInput2 = document.querySelector(".image2");
    const postIdForUpdateInput = document.querySelector(".postIdForUpdate");

    const postId = postIdForUpdateInput.value;
    const title = newTitleInput.value;
    const content = newContentInput.value;
    const token = localStorage.getItem("token") || "";

    console.log(title, content, imageInput2.files);

    if(title.trim() === "" && content.trim() === "" && imageInput2.files.length === 0) {
      return valueNotImg('Вы не выбрали не одно поле для изменения', false);
    };

    if(!postId) {
      valueNotImg("Вы не выбрали id пользователя который хотите изменить.", false);
    };

    const formData = new FormData();
    formData.append("image", imageInput2.files[0]);
    formData.append('postIdForDelete', postId);
    fetch("http://localhost:8080/post-image-delete", {
      method: "PUT",
      body: formData,
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        Authorization: token ? "Bearer " + token : ""
      },
    })
    .then(data=>data.json())
    .then(data => {
      console.log(data);

      if(data.type === 'text') {
        valueNotImg(data.result, false);
      } else {
        const { sendFile } = data;
        let image_url;
        if(sendFile) {
          image_url = data.filePath;
        };

        const graphqlQuery2 = {
          query: `
            mutation EditOnePost($postId: Int!, $title: String!, $image_url: String!, $sendFile: Boolean!) {
              editPost(postId: $postId, title: $title, content: $content, image_url: $image_url, sendFile: $sendFile) {
                post_id
                title
                content
                image_url
                creator_user_id
                post_created_at
                user_id
                name
                email
                password
                status
                user_created_at
              }
            }
          `,
		  variables: {			  
			postId,
			title,
			content,
			image_url,
			sendFile
        }
	};

	fetch(`http://localhost:8080/graphql`, {
	  method: "POST",
	  body: JSON.stringify(graphqlQuery2),
	  headers: {
		// если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
		Authorization: token ? "Bearer " + token : "",
		"Content-Type": "application/json"
	  },
	})
	.then((data) => data.json())
	.then((data) => {
	  console.log(data);

	  const errors = document.querySelector(".errors");
	  errors.innerHTML = "";

	  if (data.result === "Срок действия jwt токена истек.") {
	  userNotLogin();
	  } else if (data.errors && data.errors.length > 0) {
		errorsFromServer(data);
	  } else {
		const currentData = data.data.editPost;
		valueForImg(currentData, `http://localhost:8080/${decodeURIComponent(currentData.image_url)}`, currentData.title, `message: ${currentData.message}, id: ${currentData.post_id}, title: ${currentData.title}, content: ${currentData.content}, image_url: ${currentData.image_url}, creator_user_id: ${currentData.creator_user_id}, post_created_at: ${currentData.post_created_at}, creator_id: ${currentData.user_id}, creator_name: ${currentData.name}, creaor_email: ${currentData.email}, creator_password: ${currentData.password}, creator_status: ${currentData.status}, createdAt: ${currentData.user_created_at}`);
	  };
	})
	.catch((err) => console.log(err));
    }
  })
  .catchh(err=>console.log(err));
  } else if (e.target.closest(".five")) {
    const postIdForDeleteInput = document.querySelector(".postIdForDelete");

    const postId = postIdForDeleteInput.value;
    const token = localStorage.getItem("token") || "";

    fetch(`http://localhost:8080/post-image-delete`, {
      method: "PUT",
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        "Authorization": (token) ? ("Bearer " + token) : (""),
		"Content-Type": "application/json"
      },
	  body: JSON.stringify({
		  postIdForDelete: postId
	  })
    })
      .then((data) => data.json())
      .then((data) => {
        console.log(data);
		
		const graphqlQuery = {
			query: `
				mutation DeleteOnePostById($postId: Int!) {
					deletePost(postId: $postId) {
						message
					}
				}
			`,
			variables: {
				postId
			}
		};
		
		fetch('http://localhost:8080/graphql', {
			method: "POST",
			headers: {
				// если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
				"Authorization": (token)? ('Bearer ' + token): (''),
				"Content-Type": "application/json"
			},
			body: JSON.stringify(graphqlQuery)
		})
		.then(data=>data.json())
		.then(data => {
			console.log(data);
			
			const errors = document.querySelector(".errors");
			errors.innerHTML = "";

			if (data.result === "Срок действия jwt токена истек.") {
				userNotLogin();
			} else if (data.errors && data.errors.length > 0) {
				errorsFromServer(data);
			} else {
				valueNotImg(data.data.deletePost.message, true);
			};
		})
		.catch(err=>console.log(err));
      })
      .catch((err) => console.log(err));
  } else if (e.target.closest(".six")) {
    const newStatusInput = document.querySelector(".newStatus");
    const token = localStorage.getItem("token") || "";

    const newStatus = newStatusInput.value;
	
	if(!newStatus) {
		return valueNotImg('Введите новый статус', false);
	};
	
	const graphqlQuery = {
		query: `
			mutation SetStatus($newStatus: String!) {
				setStatus(newStatus: $newStatus)
			}
		`,
		variables: {
			newStatus
		}
	};

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        Authorization: token ? "Bearer " + token : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((data) => data.json())
      .then((data) => {
        console.log(data);

        if (data.result === "Срок действия jwt токена истек.") {
			userNotLogin();
		} else if (data.errors && data.errors.length > 0) {
			errorsFromServer(data);
		} else {
			userLogin(data.data.setStatus);
			valueNotImg('Статус обновлен', true);
		};
      })
      .catch((err) => console.log(err));
  } else if (e.target.closest(".signup")) {
    const token = localStorage.getItem("token") || "";
    const nameInput = document.querySelector(".name");
    const emailInput = document.querySelector(".email");
    const passwordInput = document.querySelector(".password");
    const confirmPasswordInput = document.querySelector(".confirmPassword");

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    console.log(name, email, password, confirmPassword);

    const errors = document.querySelector(".errors");
    errors.innerHTML = "";
    if (password !== confirmPassword) {
      valueNotImg("message: Пароли не совпадают.", false);
    } else {
      const graphqlQuery = {
        query: `
          mutation CreateUser($name: String!, $email: String!, $password: String!) {
            createUser(userInput: { name: $name, email: $email, password: $password} ) {
              message
              status
              userId
            }
          }
        `,
		variables: {
			name,email,password
		}
      };
      fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
          Authorization: token ? "Bearer " + token : "",
        },
        body: JSON.stringify(graphqlQuery),
      })
        .then((data) => data.json())
        .then((data) => {
          console.log(data);

          // errors: [
          //   {
          //     message: 'Данные не прошли проверку валидности',
          //     status: 422,
          //     data: [ { message: "Пароль слишком короткий", value: "ert" } ]
          //   }
          // ]

          if (data.errors && data.errors.length > 0) {
            errorsFromServer(data);
          } else {
            const currentData = data.data.createUser;
            nameInput.value =
              emailInput.value =
              passwordInput.value =
              confirmPasswordInput.value =
                "";
            userLogin(currentData.status);
            localStorage.setItem("token", currentData.token);

            valueNotImg(
              `message: ${data.data.createUser.message}, userId: ${data.data.createUser.userId}`,
              true,
            );
          }
        })
        .catch((err) => console.log(err));
    }
  } else if (e.target.closest(".login")) {
    const token = localStorage.getItem("token");
    const emailForLoginInput = document.querySelector(".emailForLogin");
    const passwordForLoginInput = document.querySelector(".passwordForLogin");

    const email = emailForLoginInput.value;
    const password = passwordForLoginInput.value;
    console.log(email, password);

    const graphqlQuery = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId, status, token
          }
        }
      `,
	  variables: {
		  email,
		  password
	  }
    };
    console.log(graphqlQuery);

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // если token есть отправить 'Bearer ' + токен а если нету пустую строку что бы мидлевар is-auth выдал ошибку 401 Not authenticated.
        Authorization: token ? "Bearer " + token : "",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((data) => data.json())
      .then((data) => {
        console.log(data);

        const errors = document.querySelector(".errors");
        errors.innerHTML = "";

        if (data.errors && data.errors.length > 0) {
          errorsFromServer(data);
        } else {
          const currentData = data.data.login;
          emailForLoginInput.value = passwordForLoginInput.value = "";
          userLogin(currentData.status);
          localStorage.setItem("token", currentData.token);

          valueNotImg(
            "Вы зашли в аккаунт пользователя с id: " + currentData.userId,
            true,
          );
        }
      })
      .catch((err) => console.log(err));
  } else if (e.target.closest(".logout")) {
    userNotLogin();
  } else if (e.target.closest(".clean")) {
    const paginationContainerButtons =
      document.querySelector(".paginationButtons");
    const paginationContainerPosts = document.querySelector(".paginationPosts");
    const root = document.querySelector(".root");
    const errors = document.querySelector(".errors");

    root.innerHTML = "";
    errors.innerHTML = "";
    if (paginationContainerButtons && paginationContainerPosts) {
      paginationContainerButtons.innerHTML = "";
      paginationContainerPosts.innerHTML = "";
    };
  };
});

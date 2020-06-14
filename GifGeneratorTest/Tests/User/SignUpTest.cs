using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using GifGenerator.Models.Users;
using GifGeneratorTest.Helpers;
using GifGeneratorTest.Models;
using Xunit;

namespace GifGeneratorTest.Tests.User
{
    public class SignUpTest : IAsyncLifetime
    {
        private readonly Database db = Database.Create();

        public Task InitializeAsync()
        {
            return FbDbHelper.SetDatabase(db);
        }

        public Task DisposeAsync()
        {
            return FbDbHelper.ClearDatabase();
        }

        [Fact]
        public async void SignUp_CallValidCredentials_ReturnOkAsync()
        {
            CreateUserBody createUserBody = new CreateUserBody()
            {
                Username = "myUsername",
                Password = "insecure",
            };

            HttpStatusCode createUserResponseCode = await Api.PostCodeAsync("api/user", createUserBody);
            Assert.Equal(HttpStatusCode.OK, createUserResponseCode);
        }

        [Fact]
        public async void SignUp_CallInvalidUsername_ReturnBadRequestAsync()
        {
            CreateUserBody createUserBody = new CreateUserBody()
            {
                Username = "my user name",
                Password = "insecure",
            };

            using (HttpResponseMessage response = await Api.PostAsync("api/user", createUserBody))
            {
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                Assert.Equal("Username is not valid", await response.Content.ReadAsStringAsync());
            }
        }

        [Fact]
        public async void SignUp_CallInvalidPassword_ReturnBadRequestAsync()
        {
            CreateUserBody createUserBody = new CreateUserBody()
            {
                Username = "validName",
                Password = "short",
            };

            using (HttpResponseMessage response = await Api.PostAsync("api/user", createUserBody))
            {
                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                Assert.Equal("Password is not valid", await response.Content.ReadAsStringAsync());
            }
        }

        public class UserAlreadyExists : IAsyncLifetime
        {
            private readonly Database db = Database.Create(new[]
            {
                new DbUser("existingUser", password: "somePassword")
            });

            public Task InitializeAsync()
            {
                return FbDbHelper.SetDatabase(db);
            }

            public Task DisposeAsync()
            {
                return FbDbHelper.ClearDatabase();
            }

            [Fact]
            public async void SignUp_CallExistingUser_ReturnBadRequestAsync()
            {
                CreateUserBody createUserBody = new CreateUserBody()
                {
                    Username = "existingUser",
                    Password = "insecure",
                };

                using (HttpResponseMessage response = await Api.PostAsync("api/user", createUserBody))
                {
                    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                    Assert.Equal("User already exists", await response.Content.ReadAsStringAsync());
                }
            }
        }
    }
}

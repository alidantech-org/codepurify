from utils.naming import pascal_case, camel_case, snake_case


def test_pascal_case():
    assert pascal_case("hello_world") == "HelloWorld"
    assert pascal_case("hello-world") == "HelloWorld"
    assert pascal_case("hello world") == "HelloWorld"


def test_camel_case():
    assert camel_case("hello_world") == "helloWorld"
    assert camel_case("HelloWorld") == "helloWorld"


def test_snake_case():
    assert snake_case("helloWorld") == "hello_world"
    assert snake_case("HelloWorld") == "hello_world"
    assert snake_case("hello-world") == "hello_world"
